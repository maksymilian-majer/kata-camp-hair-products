import type { User } from '@hair-product-scanner/shared';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationException } from '@/api/shared/exceptions';

import { AuthenticatorImpl } from './authenticator.service-impl';
import type { UserRepository, UserWithPasswordHash } from './user.repository';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('AuthenticatorImpl', () => {
  let authenticator: AuthenticatorImpl;
  let mockUserRepository: UserRepository;
  let mockJwtService: JwtService;

  const mockUser: User = {
    id: 'user-1',
    email: 'alex@example.com',
    displayName: 'Alex',
    createdAt: '2024-01-15T10:00:00Z',
  };

  const mockUserWithPasswordHash: UserWithPasswordHash = {
    ...mockUser,
    passwordHash: '$2b$10$hashedpassword',
  };

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      existsByEmail: vi.fn(),
    };

    mockJwtService = {
      sign: vi.fn().mockReturnValue('mock.jwt.token'),
    } as unknown as JwtService;

    authenticator = new AuthenticatorImpl(mockUserRepository, mockJwtService);

    vi.mocked(bcrypt.hash).mockResolvedValue('$2b$10$hashedpassword' as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(false);
      vi.mocked(mockUserRepository.create).mockResolvedValue(mockUser);

      const result = await authenticator.register({
        email: 'alex@example.com',
        password: 'SecurePass1!',
        displayName: 'Alex',
        acceptedTerms: true,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass1!', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'alex@example.com',
        passwordHash: '$2b$10$hashedpassword',
        displayName: 'Alex',
      });
      expect(result).toEqual({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });
    });

    it('should throw CONFLICT for existing email', async () => {
      vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(true);

      await expect(
        authenticator.register({
          email: 'existing@example.com',
          password: 'SecurePass1!',
          displayName: 'Alex',
          acceptedTerms: true,
        })
      ).rejects.toThrow(ValidationException);

      await expect(
        authenticator.register({
          email: 'existing@example.com',
          password: 'SecurePass1!',
          displayName: 'Alex',
          acceptedTerms: true,
        })
      ).rejects.toMatchObject({
        code: 'CONFLICT',
      });

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should use display name from email if not provided', async () => {
      vi.mocked(mockUserRepository.existsByEmail).mockResolvedValue(false);
      vi.mocked(mockUserRepository.create).mockResolvedValue({
        ...mockUser,
        displayName: 'alex',
      });

      await authenticator.register({
        email: 'alex@example.com',
        password: 'SecurePass1!',
        acceptedTerms: true,
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'alex@example.com',
        passwordHash: '$2b$10$hashedpassword',
        displayName: 'alex',
      });
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(
        mockUserWithPasswordHash
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authenticator.login({
        email: 'alex@example.com',
        password: 'SecurePass1!',
      });

      expect(result).toEqual({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UNAUTHORIZED for wrong password', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(
        mockUserWithPasswordHash
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authenticator.login({
          email: 'alex@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(ValidationException);

      await expect(
        authenticator.login({
          email: 'alex@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should throw UNAUTHORIZED for non-existent email', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      await expect(
        authenticator.login({
          email: 'nonexistent@example.com',
          password: 'SecurePass1!',
        })
      ).rejects.toThrow(ValidationException);

      await expect(
        authenticator.login({
          email: 'nonexistent@example.com',
          password: 'SecurePass1!',
        })
      ).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(
        mockUserWithPasswordHash
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authenticator.validateUser(
        'alex@example.com',
        'SecurePass1!'
      );

      expect(result).toEqual(mockUser);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'SecurePass1!',
        '$2b$10$hashedpassword'
      );
    });

    it('should return null for invalid credentials', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(
        mockUserWithPasswordHash
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await authenticator.validateUser(
        'alex@example.com',
        'wrongpassword'
      );

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

      const result = await authenticator.validateUser(
        'nonexistent@example.com',
        'password'
      );

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with user payload', () => {
      const token = authenticator.generateToken(mockUser);

      expect(token).toBe('mock.jwt.token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
