import type { User } from '@hair-product-scanner/shared';
import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDB } from '@/api/database/drizzle.module';
import * as schema from '@/api/database/schema';

import type {
  CreateUserData,
  UserRepository,
  UserWithPasswordHash,
} from './user.repository';

@Injectable()
export class UserDrizzleRepository implements UserRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB
  ) {}

  async findById(id: string): Promise<UserWithPasswordHash | null> {
    const results = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    return results[0] ? this.toUserWithPasswordHash(results[0]) : null;
  }

  async findByEmail(email: string): Promise<UserWithPasswordHash | null> {
    const results = await this.db
      .select()
      .from(schema.users)
      .where(sql`LOWER(${schema.users.email}) = LOWER(${email})`)
      .limit(1);

    return results[0] ? this.toUserWithPasswordHash(results[0]) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const results = await this.db
      .insert(schema.users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
      })
      .returning();

    return this.toUser(results[0]);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const results = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`LOWER(${schema.users.email}) = LOWER(${email})`)
      .limit(1);

    return results.length > 0;
  }

  private toUser(row: schema.UserRow): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName ?? null,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private toUserWithPasswordHash(row: schema.UserRow): UserWithPasswordHash {
    return {
      ...this.toUser(row),
      passwordHash: row.passwordHash,
    };
  }
}
