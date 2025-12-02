import path from 'node:path';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AppModule } from '@/api/app/app.module';
import * as schema from '@/api/database/schema';

const MIGRATIONS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'database',
  'migrations'
);

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('test_db')
      .start();

    const connectionString = container.getConnectionUri();
    process.env['DATABASE_URL'] = connectionString;
    process.env['JWT_SECRET'] = 'test-secret-for-e2e-tests';

    pool = new Pool({ connectionString });
    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS_PATH });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 120000);

  afterAll(async () => {
    await app.close();
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.users);
  });

  describe('POST /api/auth/signup', () => {
    it('should create user and return 201 with token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'new@example.com',
          password: 'SecurePass1!',
          displayName: 'New User',
          acceptedTerms: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('new@example.com');
      expect(response.body.user.displayName).toBe('New User');
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should create user with generated displayName when not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'auto-name@example.com',
          password: 'SecurePass1!',
          acceptedTerms: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.user.displayName).toBe('auto-name');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
          acceptedTerms: true,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when terms not accepted', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePass1!',
          acceptedTerms: false,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'SecurePass1!',
          acceptedTerms: true,
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 for existing email', async () => {
      await request(app.getHttpServer()).post('/api/auth/signup').send({
        email: 'existing@example.com',
        password: 'SecurePass1!',
        acceptedTerms: true,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'AnotherPass1!',
          acceptedTerms: true,
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with token for valid credentials', async () => {
      await request(app.getHttpServer()).post('/api/auth/signup').send({
        email: 'login@example.com',
        password: 'SecurePass1!',
        acceptedTerms: true,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass1!',
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
    });

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer()).post('/api/auth/signup').send({
        email: 'user@example.com',
        password: 'SecurePass1!',
        acceptedTerms: true,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'WrongPassword1!',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass1!',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          password: 'SecurePass1!',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user for valid token', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'me@example.com',
          password: 'SecurePass1!',
          displayName: 'Test User',
          acceptedTerms: true,
        });

      const token = signupResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('me@example.com');
      expect(response.body.displayName).toBe('Test User');
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return 401 for malformed authorization header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'malformed');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 for successful logout', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({
          email: 'logout@example.com',
          password: 'SecurePass1!',
          acceptedTerms: true,
        });

      const token = signupResponse.body.accessToken;

      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer()).post(
        '/api/auth/logout'
      );

      expect(response.status).toBe(401);
    });
  });
});
