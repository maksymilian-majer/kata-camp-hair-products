import path from 'node:path';

import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import * as schema from '@/api/database/schema';

import { UserDrizzleRepository } from './user.drizzle-repository';

const MIGRATIONS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'database',
  'migrations'
);

describe('UserDrizzleRepository', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;
  let repository: UserDrizzleRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('test_db')
      .start();

    pool = new Pool({
      connectionString: container.getConnectionUri(),
    });

    db = drizzle(pool, { schema });
    await migrate(db, {
      migrationsFolder: MIGRATIONS_PATH,
    });

    repository = new UserDrizzleRepository(db);
  }, 120000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.users);
  });

  describe('create', () => {
    it('should create user and return with generated ID', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password_123',
        displayName: 'Test User',
      };

      const user = await repository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.id).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
      );
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.createdAt).toBeDefined();
    });

    it('should create user with null displayName', async () => {
      const userData = {
        email: 'nodisplay@example.com',
        passwordHash: 'hashed_password_456',
        displayName: null,
      };

      const user = await repository.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe('nodisplay@example.com');
      expect(user.displayName).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'findme@example.com',
        passwordHash: 'hashed_password_789',
        displayName: 'Find Me',
      };
      await repository.create(userData);

      const found = await repository.findByEmail('findme@example.com');

      expect(found).not.toBeNull();
      expect(found?.email).toBe('findme@example.com');
      expect(found?.displayName).toBe('Find Me');
      expect(found?.passwordHash).toBe('hashed_password_789');
    });

    it('should return null for non-existent email', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });

    it('should be case-insensitive for email lookup', async () => {
      const userData = {
        email: 'CaseSensitive@Example.Com',
        passwordHash: 'hashed_password',
        displayName: null,
      };
      await repository.create(userData);

      const found = await repository.findByEmail('casesensitive@example.com');

      expect(found).not.toBeNull();
      expect(found?.email).toBe('CaseSensitive@Example.Com');
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userData = {
        email: 'byid@example.com',
        passwordHash: 'hashed_password_abc',
        displayName: 'By ID',
      };
      const created = await repository.create(userData);

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('byid@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById(
        '00000000-0000-0000-0000-000000000000'
      );

      expect(found).toBeNull();
    });
  });

  describe('unique email constraint', () => {
    it('should enforce unique email constraint', async () => {
      const userData1 = {
        email: 'duplicate@example.com',
        passwordHash: 'hash1',
        displayName: 'User 1',
      };
      await repository.create(userData1);

      const userData2 = {
        email: 'duplicate@example.com',
        passwordHash: 'hash2',
        displayName: 'User 2',
      };

      await expect(repository.create(userData2)).rejects.toThrow();
    });
  });

  describe('existsByEmail', () => {
    it('should return true when email exists', async () => {
      const userData = {
        email: 'exists@example.com',
        passwordHash: 'hashed',
        displayName: null,
      };
      await repository.create(userData);

      const exists = await repository.existsByEmail('exists@example.com');

      expect(exists).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      const exists = await repository.existsByEmail('notexists@example.com');

      expect(exists).toBe(false);
    });
  });
});
