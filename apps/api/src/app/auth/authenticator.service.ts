import type {
  LoginRequest,
  SignupRequest,
  User,
} from '@hair-product-scanner/shared';

export type AuthResult = {
  accessToken: string;
  user: User;
};

export interface Authenticator {
  register(data: SignupRequest): Promise<AuthResult>;
  login(data: LoginRequest): Promise<AuthResult>;
  validateUser(email: string, password: string): Promise<User | null>;
  generateToken(user: User): string;
}

export const AUTHENTICATOR = Symbol('AUTHENTICATOR');
