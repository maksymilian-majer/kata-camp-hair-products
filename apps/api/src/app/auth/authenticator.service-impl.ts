import type {
  LoginRequest,
  SignupRequest,
  User,
} from '@hair-product-scanner/shared';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { ValidationException } from '@/api/shared/exceptions';

import type { Authenticator, AuthResult } from './authenticator.service';
import { USER_REPOSITORY, UserRepository } from './user.repository';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthenticatorImpl implements Authenticator {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register(data: SignupRequest): Promise<AuthResult> {
    const emailExists = await this.userRepository.existsByEmail(data.email);
    if (emailExists) {
      throw ValidationException.conflict(
        'An account with this email already exists'
      );
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const displayName =
      data.displayName ?? this.extractDisplayNameFromEmail(data.email);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      displayName,
    });

    const accessToken = this.generateToken(user);

    return { accessToken, user };
  }

  async login(data: LoginRequest): Promise<AuthResult> {
    const user = await this.validateUser(data.email, data.password);

    if (!user) {
      throw ValidationException.unauthorized('Invalid email or password');
    }

    const accessToken = this.generateToken(user);

    return { accessToken, user };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const userWithPassword = await this.userRepository.findByEmail(email);

    if (!userWithPassword) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.passwordHash
    );

    if (!isPasswordValid) {
      return null;
    }

    const { passwordHash: _, ...user } = userWithPassword;
    return user;
  }

  generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }

  private extractDisplayNameFromEmail(email: string): string {
    return email.split('@')[0];
  }
}
