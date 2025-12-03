import type { LoginRequest, SignupRequest } from '@hair-product-scanner/shared';
import { loginSchema, signupRequestSchema } from '@hair-product-scanner/shared';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ValidationException } from '@/api/shared/exceptions';

import type { Authenticator } from './authenticator.service';
import { AUTHENTICATOR } from './authenticator.service';
import { JwtAuthGuard } from './jwt-auth.guard';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      email: string;
      displayName: string | null;
      createdAt: string;
    };
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTHENTICATOR)
    private readonly authenticator: Authenticator
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: SignupRequest) {
    const result = signupRequestSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new BadRequestException(firstIssue?.message ?? 'Validation failed');
    }

    try {
      return await this.authenticator.register(result.data);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequest) {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new BadRequestException(firstIssue?.message ?? 'Validation failed');
    }

    try {
      return await this.authenticator.login(result.data);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }

  private mapError(error: unknown): Error {
    if (error instanceof ValidationException) {
      switch (error.code) {
        case 'NOT_FOUND':
        case 'UNAUTHORIZED': {
          return new UnauthorizedException(error.message);
        }
        case 'CONFLICT': {
          return new ConflictException(error.message);
        }
        case 'INVALID_INPUT': {
          return new BadRequestException(error.message);
        }
      }
    }
    Logger.error(error);
    return new InternalServerErrorException('An unexpected error occurred');
  }
}
