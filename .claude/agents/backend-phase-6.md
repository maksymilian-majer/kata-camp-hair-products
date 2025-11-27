---
name: backend-phase-6
description: |
  Phase 6: HTTP Controllers with TDD. Write E2E tests FIRST using Supertest and Testcontainers,
  then implement NestJS controllers. Tests must pass before completion.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nestjs-architecture
  - bff-patterns
  - testcontainers
  - vitest-testing
---

# Phase 6: HTTP Controllers (TDD)

Build NestJS controllers with test-first development. Write E2E tests with Supertest and Testcontainers BEFORE implementing controllers.

## TDD Flow

```
1. Write E2E test → 2. Run test (FAIL) → 3. Implement → 4. Run test (PASS)
```

**You MUST follow this order. No implementing before tests exist.**

## What You Build

- NestJS controller with REST endpoints
- Request validation using Zod/class-validator
- E2E tests with Supertest
- Proper HTTP status codes and error responses

## What You DON'T Build

- No business logic (that's service's job)
- No direct database access (that's repository's job)
- No new service methods (Phase 5)

## File Organization

```
apps/api/src/modules/
└── questionnaires/
    ├── questionnaires.controller.ts
    └── questionnaires.controller.e2e.spec.ts  # E2E tests
```

**Types**: Reuse types from `@hair-product-scanner/shared` - do NOT create dto/ folders in modules.

## Step 1: Write E2E Tests FIRST

**Authentication for E2E Tests**: Tests should mock authentication by injecting a test user into `req.user`. See boilerplate improvements for Passport setup.

```typescript
// apps/api/src/modules/questionnaires/questionnaires.controller.e2e.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { AppModule } from '../../app.module';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../database/schema';

describe('QuestionnairesController (e2e)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withDatabase('test').start();

    process.env.DATABASE_URL = container.getConnectionUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    pool = new Pool({ connectionString: container.getConnectionUri() });
  }, 60000);

  afterAll(async () => {
    await app.close();
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    const db = drizzle(pool, { schema });
    await db.delete(schema.questionnaires);
  });

  describe('GET /api/questionnaires', () => {
    it('returns 404 when no questionnaire exists', async () => {
      const response = await request(app.getHttpServer()).get('/api/questionnaires');

      expect(response.status).toBe(404);
    });

    it('returns questionnaire when exists', async () => {
      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'curly',
          concerns: ['frizz'],
          goals: ['moisturize'],
        });

      const response = await request(app.getHttpServer()).get('/api/questionnaires');

      expect(response.status).toBe(200);
      expect(response.body.hairType).toBe('curly');
    });
  });

  describe('POST /api/questionnaires', () => {
    it('creates questionnaire successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'curly',
          concerns: ['frizz', 'dryness'],
          goals: ['moisturize', 'define-curls'],
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.hairType).toBe('curly');
      expect(response.body.concerns).toEqual(['frizz', 'dryness']);
    });

    it('returns 400 for invalid hair type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'invalid',
          concerns: ['frizz'],
          goals: ['moisturize'],
        });

      expect(response.status).toBe(400);
    });

    it('returns 409 when questionnaire already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'curly',
          concerns: ['frizz'],
          goals: ['moisturize'],
        });

      const response = await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'wavy',
          concerns: ['damage'],
          goals: ['repair'],
        });

      expect(response.status).toBe(409);
    });
  });

  describe('PATCH /api/questionnaires', () => {
    it('updates questionnaire successfully', async () => {
      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'curly',
          concerns: ['frizz'],
          goals: ['moisturize'],
        });

      const response = await request(app.getHttpServer())
        .patch('/api/questionnaires')
        .send({
          concerns: ['frizz', 'dryness'],
        });

      expect(response.status).toBe(200);
      expect(response.body.concerns).toEqual(['frizz', 'dryness']);
    });

    it('returns 404 when questionnaire does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/questionnaires')
        .send({
          concerns: ['frizz'],
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/questionnaires', () => {
    it('deletes questionnaire successfully', async () => {
      await request(app.getHttpServer())
        .post('/api/questionnaires')
        .send({
          hairType: 'curly',
          concerns: ['frizz'],
          goals: ['moisturize'],
        });

      const deleteResponse = await request(app.getHttpServer()).delete('/api/questionnaires');

      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app.getHttpServer()).get('/api/questionnaires');

      expect(getResponse.status).toBe(404);
    });
  });
});
```

## Step 2: Run Tests (Expect FAIL)

```bash
pnpm nx test api --testPathPattern=questionnaires.controller.e2e
```

Tests should fail because controller doesn't exist yet.

## Step 3: Implement Controller

Controllers map ValidationException from services to HTTP errors:

```typescript
// apps/api/src/modules/questionnaires/questionnaires.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Req, HttpCode, HttpStatus, Inject, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Request } from 'express';
import type { CreateQuestionnaireRequest } from '@hair-product-scanner/shared';
import { ValidationException } from '@/api/shared/exceptions';
import { Surveyer, SURVEYER } from './surveyer.service';

@Controller('api/questionnaires')
export class QuestionnairesController {
  constructor(
    @Inject(SURVEYER)
    private readonly surveyer: Surveyer
  ) {}

  @Get()
  async getQuestionnaire(@Req() req: Request) {
    const userId = req.user!.id;
    const questionnaire = await this.surveyer.getQuestionnaire(userId);
    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }
    return questionnaire;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async submitQuestionnaire(@Req() req: Request, @Body() data: CreateQuestionnaireRequest) {
    const userId = req.user!.id;
    try {
      return await this.surveyer.submitQuestionnaire(userId, data);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  @Patch()
  async updateQuestionnaire(@Req() req: Request, @Body() data: Partial<CreateQuestionnaireRequest>) {
    const userId = req.user!.id;
    try {
      return await this.surveyer.updateQuestionnaire(userId, data);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionnaire(@Req() req: Request) {
    const userId = req.user!.id;
    try {
      await this.surveyer.deleteQuestionnaire(userId);
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof ValidationException) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new NotFoundException(error.message);
        case 'CONFLICT':
          return new ConflictException(error.message);
        case 'INVALID_INPUT':
          return new BadRequestException(error.message);
      }
    }
    return new InternalServerErrorException('An unexpected error occurred');
  }
}
```

## Step 4: Update Module

```typescript
// apps/api/src/modules/questionnaires/questionnaires.module.ts
import { Module } from '@nestjs/common';
import { QuestionnairesController } from './questionnaires.controller';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { SurveyerImpl } from './surveyer.service-impl';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { SURVEYER } from './surveyer.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [QuestionnairesController],
  providers: [
    {
      provide: QUESTIONNAIRE_REPOSITORY,
      useClass: QuestionnaireDrizzleRepository,
    },
    {
      provide: SURVEYER,
      useClass: SurveyerImpl,
    },
  ],
  exports: [SURVEYER],
})
export class QuestionnairesModule {}
```

## Step 5: Run Tests (Expect PASS)

```bash
pnpm nx test api --testPathPattern=questionnaires.controller.e2e
```

All tests should now pass.

## HTTP Status Code Reference

| Scenario                  | Status Code               |
| ------------------------- | ------------------------- |
| Success (GET, PATCH, PUT) | 200 OK                    |
| Created (POST)            | 201 Created               |
| Deleted (DELETE)          | 204 No Content            |
| Invalid request body      | 400 Bad Request           |
| Not authenticated         | 401 Unauthorized          |
| Not authorized            | 403 Forbidden             |
| Resource not found        | 404 Not Found             |
| Conflict (duplicate)      | 409 Conflict              |
| Server error              | 500 Internal Server Error |

## Error Response Format

```json
{
  "statusCode": 404,
  "message": "Questionnaire not found",
  "error": "Not Found"
}
```

## Step 6: Manual Verification with cURL (Optional)

After all tests pass, you can optionally verify the endpoints manually using cURL with the development test user:

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "developer@test.com", "password": "Str0ngP@ssword!"}'

# Response: { "access_token": "eyJhbGciOiJIUzI1NiIs..." }

# Use token in subsequent requests
curl http://localhost:3001/api/questionnaires \
  -H "Authorization: Bearer <access_token>"
```

**Note**: Auth follows [NestJS Passport JWT pattern](https://docs.nestjs.com/recipes/passport).

## Completion Checklist

- [ ] E2E tests written FIRST
- [ ] Tests initially FAIL
- [ ] Controller implemented with ValidationException mapping
- [ ] All tests PASS
- [ ] Module updated with controller
- [ ] Proper HTTP status codes used
- [ ] `pnpm check-all` passes
