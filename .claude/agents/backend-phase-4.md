---
name: backend-phase-4
description: |
  Phase 4: Repository Layer with TDD. Write integration tests FIRST using Testcontainers,
  then implement Drizzle repositories. Tests must pass before phase completion.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nestjs-architecture
  - drizzle-repository
  - testcontainers
  - vitest-testing
---

# Phase 4: Repository Layer (TDD)

Build the data access layer using Drizzle ORM with test-first development. Write integration tests with Testcontainers BEFORE implementing repositories.

## TDD Flow

```
1. Write test → 2. Run test (FAIL) → 3. Implement → 4. Run test (PASS)
```

**You MUST follow this order. No implementing before tests exist.**

## What You Build

- Repository interface
- Repository implementation with Drizzle
- Integration tests with Testcontainers
- Database migrations (if needed)

## What You DON'T Build

- No HTTP endpoints (Phase 6)
- No services (Phase 5)
- No business logic (Phase 5)

## File Organization

```
apps/api/src/
├── database/
│   ├── schema/
│   │   ├── index.ts              # Re-exports all tables
│   │   └── questionnaires.ts     # Drizzle schema
│   └── migrations/               # SQL migrations
└── modules/
    └── questionnaires/
        ├── questionnaire.repository.ts           # Interface
        ├── questionnaire.drizzle-repository.ts   # Drizzle implementation
        └── questionnaire.repository.spec.ts      # Integration tests
```

## Step 1: Define Repository Interface

```typescript
// apps/api/src/modules/questionnaires/questionnaire.repository.ts
import type { Questionnaire, CreateQuestionnaireRequest } from '@hair-product-scanner/shared';

export interface QuestionnaireRepository {
  findById(id: string): Promise<Questionnaire | null>;
  findByUserId(userId: string): Promise<Questionnaire | null>;
  create(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire>;
  update(id: string, data: Partial<CreateQuestionnaireRequest>): Promise<Questionnaire>;
  delete(id: string): Promise<void>;
}

export const QUESTIONNAIRE_REPOSITORY = Symbol('QUESTIONNAIRE_REPOSITORY');
```

## Step 2: Write Tests FIRST

```typescript
// apps/api/src/modules/questionnaires/questionnaire.repository.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import * as schema from '../../database/schema';

describe('QuestionnaireDrizzleRepository', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let repository: QuestionnaireDrizzleRepository;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().withDatabase('test').start();

    pool = new Pool({
      connectionString: container.getConnectionUri(),
    });

    db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: './src/database/migrations' });

    repository = new QuestionnaireDrizzleRepository(db);
  }, 60000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.questionnaires);
  });

  describe('create', () => {
    it('creates a questionnaire', async () => {
      const questionnaire = await repository.create('user-1', {
        hairType: 'curly',
        concerns: ['frizz', 'dryness'],
        goals: ['moisturize'],
      });

      expect(questionnaire.id).toBeDefined();
      expect(questionnaire.hairType).toBe('curly');
      expect(questionnaire.concerns).toEqual(['frizz', 'dryness']);
      expect(questionnaire.goals).toEqual(['moisturize']);
    });
  });

  describe('findById', () => {
    it('returns questionnaire when found', async () => {
      const created = await repository.create('user-1', {
        hairType: 'wavy',
        concerns: ['damage'],
        goals: ['repair'],
      });

      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('returns null when not found', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('returns questionnaire for user', async () => {
      await repository.create('user-1', {
        hairType: 'straight',
        concerns: ['oily'],
        goals: ['volume'],
      });

      const found = await repository.findByUserId('user-1');

      expect(found).not.toBeNull();
      expect(found?.hairType).toBe('straight');
    });
  });

  describe('update', () => {
    it('updates questionnaire fields', async () => {
      const created = await repository.create('user-1', {
        hairType: 'curly',
        concerns: ['frizz'],
        goals: ['define'],
      });

      const updated = await repository.update(created.id, {
        concerns: ['frizz', 'dryness'],
      });

      expect(updated.concerns).toEqual(['frizz', 'dryness']);
      expect(updated.hairType).toBe('curly');
    });
  });

  describe('delete', () => {
    it('removes questionnaire', async () => {
      const created = await repository.create('user-1', {
        hairType: 'coily',
        concerns: ['breakage'],
        goals: ['strengthen'],
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
```

## Step 3: Run Tests (Expect FAIL)

```bash
pnpm nx test api --testPathPattern=questionnaire.repository
```

Tests should fail because repository doesn't exist yet.

## Step 4: Define Drizzle Schema

```typescript
// apps/api/src/database/schema/questionnaires.ts
import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  hairType: varchar('hair_type', { length: 50 }).notNull(),
  concerns: jsonb('concerns').$type<string[]>().notNull().default([]),
  goals: jsonb('goals').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QuestionnaireRow = typeof questionnaires.$inferSelect;
export type NewQuestionnaireRow = typeof questionnaires.$inferInsert;
```

Don't forget to export from index:

```typescript
// apps/api/src/database/schema/index.ts
export * from './questionnaires';
```

## Step 5: Generate Migration

```bash
pnpm db:generate
```

## Step 6: Implement Repository

```typescript
// apps/api/src/modules/questionnaires/questionnaire.drizzle-repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Questionnaire, CreateQuestionnaireRequest } from '@hair-product-scanner/shared';
import { QuestionnaireRepository } from './questionnaire.repository';
import * as schema from '../../database/schema';
import { DRIZZLE } from '../../database/drizzle.provider';

@Injectable()
export class QuestionnaireDrizzleRepository implements QuestionnaireRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async findById(id: string): Promise<Questionnaire | null> {
    const results = await this.db.select().from(schema.questionnaires).where(eq(schema.questionnaires.id, id)).limit(1);

    return results[0] ? this.toQuestionnaire(results[0]) : null;
  }

  async findByUserId(userId: string): Promise<Questionnaire | null> {
    const results = await this.db.select().from(schema.questionnaires).where(eq(schema.questionnaires.userId, userId)).limit(1);

    return results[0] ? this.toQuestionnaire(results[0]) : null;
  }

  async create(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire> {
    const results = await this.db
      .insert(schema.questionnaires)
      .values({
        userId,
        hairType: data.hairType,
        concerns: data.concerns,
        goals: data.goals,
      })
      .returning();

    return this.toQuestionnaire(results[0]);
  }

  async update(id: string, data: Partial<CreateQuestionnaireRequest>): Promise<Questionnaire> {
    const results = await this.db
      .update(schema.questionnaires)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.questionnaires.id, id))
      .returning();

    return this.toQuestionnaire(results[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(schema.questionnaires).where(eq(schema.questionnaires.id, id));
  }

  private toQuestionnaire(row: schema.QuestionnaireRow): Questionnaire {
    return {
      id: row.id,
      userId: row.userId,
      hairType: row.hairType as Questionnaire['hairType'],
      concerns: row.concerns,
      goals: row.goals,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
```

## Step 7: Run Tests (Expect PASS)

```bash
pnpm nx test api --testPathPattern=questionnaire.repository
```

All tests should now pass.

## Step 8: Register in Module

```typescript
// apps/api/src/modules/questionnaires/questionnaires.module.ts
import { Module } from '@nestjs/common';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: QUESTIONNAIRE_REPOSITORY,
      useClass: QuestionnaireDrizzleRepository,
    },
  ],
  exports: [QUESTIONNAIRE_REPOSITORY],
})
export class QuestionnairesModule {}
```

## Error Handling

Repository layer should NOT throw exceptions - return `null` for not found and let the service layer handle it:

```typescript
async findById(id: string): Promise<Questionnaire | null> {
  const [result] = await this.db
    .select()
    .from(schema.questionnaires)
    .where(eq(schema.questionnaires.id, id))
    .limit(1);

  return result ? this.toQuestionnaire(result) : null;
}
```

The service layer (Phase 5) will throw `ValidationException` when needed.

## Completion Checklist

- [ ] Tests written FIRST
- [ ] Tests initially FAIL
- [ ] Drizzle schema defined
- [ ] Migration generated with `pnpm db:generate`
- [ ] Repository implemented
- [ ] All tests PASS
- [ ] Module registered
- [ ] `pnpm check-all` passes
