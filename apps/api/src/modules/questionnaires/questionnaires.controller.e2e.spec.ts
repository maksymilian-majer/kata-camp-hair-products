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

describe('QuestionnairesController (e2e)', () => {
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
    app.setGlobalPrefix('api');
    await app.init();
  }, 120000);

  afterAll(async () => {
    await app.close();
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.questionnaires);
    await db.delete(schema.users);
  });

  async function createUserAndGetToken(): Promise<{
    token: string;
    userId: string;
  }> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass1!',
        acceptedTerms: true,
      });

    return {
      token: response.body.accessToken,
      userId: response.body.user.id,
    };
  }

  const validQuestionnaireData = {
    scalpCondition: 'seborrheic_dermatitis',
    sebumLevel: 'excessive',
    activeSymptoms: ['itching', 'yellow_scales'],
    hairStrandCondition: 'natural',
    ingredientTolerance: 'moderate',
  };

  describe('GET /api/questionnaires/me', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/questionnaires/me'
      );

      expect(response.status).toBe(401);
    });

    it('should return 404 when user has no profile', async () => {
      const { token } = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .get('/api/questionnaires/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return questionnaire when profile exists', async () => {
      const { token } = await createUserAndGetToken();

      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuestionnaireData);

      const response = await request(app.getHttpServer())
        .get('/api/questionnaires/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.scalpCondition).toBe(
        'seborrheic_dermatitis'
      );
      expect(response.body.profile.sebumLevel).toBe('excessive');
      expect(response.body.profile.activeSymptoms).toEqual([
        'itching',
        'yellow_scales',
      ]);
      expect(response.body.profile.hairStrandCondition).toBe('natural');
      expect(response.body.profile.ingredientTolerance).toBe('moderate');
    });

    it('should only return own questionnaire, not another users', async () => {
      const { token: token1 } = await createUserAndGetToken();
      const { token: token2 } = await createUserAndGetToken();

      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token1}`)
        .send(validQuestionnaireData);

      const response = await request(app.getHttpServer())
        .get('/api/questionnaires/me')
        .set('Authorization', `Bearer ${token2}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/questionnaires', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send(validQuestionnaireData);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid input - missing required fields', async () => {
      const { token } = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send({
          scalpCondition: 'seborrheic_dermatitis',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid scalp condition value', async () => {
      const { token } = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validQuestionnaireData,
          scalpCondition: 'invalid_condition',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 when activeSymptoms is empty', async () => {
      const { token } = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...validQuestionnaireData,
          activeSymptoms: [],
        });

      expect(response.status).toBe(400);
    });

    it('should create profile and return 201', async () => {
      const { token } = await createUserAndGetToken();

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuestionnaireData);

      expect(response.status).toBe(201);
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.id).toBeDefined();
      expect(response.body.profile.scalpCondition).toBe(
        'seborrheic_dermatitis'
      );
      expect(response.body.profile.createdAt).toBeDefined();
      expect(response.body.profile.updatedAt).toBeDefined();
    });

    it('should update existing profile and return 200', async () => {
      const { token } = await createUserAndGetToken();

      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuestionnaireData);

      const updatedData = {
        ...validQuestionnaireData,
        scalpCondition: 'psoriasis',
        activeSymptoms: ['redness', 'pain_burning'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.profile.scalpCondition).toBe('psoriasis');
      expect(response.body.profile.activeSymptoms).toEqual([
        'redness',
        'pain_burning',
      ]);
    });

    it('should not allow user to modify another users profile', async () => {
      const { token: token1 } = await createUserAndGetToken();
      const { token: token2 } = await createUserAndGetToken();

      const createResponse = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token1}`)
        .send(validQuestionnaireData);

      expect(createResponse.status).toBe(201);

      const user2Response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          ...validQuestionnaireData,
          scalpCondition: 'psoriasis',
        });

      expect(user2Response.status).toBe(201);

      const getResponse1 = await request(app.getHttpServer())
        .get('/api/questionnaires/me')
        .set('Authorization', `Bearer ${token1}`);

      expect(getResponse1.body.profile.scalpCondition).toBe(
        'seborrheic_dermatitis'
      );

      const getResponse2 = await request(app.getHttpServer())
        .get('/api/questionnaires/me')
        .set('Authorization', `Bearer ${token2}`);

      expect(getResponse2.body.profile.scalpCondition).toBe('psoriasis');
    });
  });
});
