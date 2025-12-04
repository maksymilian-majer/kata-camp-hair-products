import type { User } from '@hair-product-scanner/shared';

export type UserWithPasswordHash = User & {
  passwordHash: string;
};

export type CreateUserData = {
  email: string;
  passwordHash: string;
  displayName: string | null;
};

export interface UserRepository {
  findById(id: string): Promise<UserWithPasswordHash | null>;
  findByEmail(email: string): Promise<UserWithPasswordHash | null>;
  create(data: CreateUserData): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
