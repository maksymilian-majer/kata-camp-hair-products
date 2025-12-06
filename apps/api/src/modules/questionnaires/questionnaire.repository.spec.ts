import path from 'node:path';

import type { QuestionnaireProfile } from '@hair-product-scanner/shared';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import * as schema from '@/api/database/schema';

import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import type { NewQuestionnaire } from './questionnaire.repository';

const MIGRATIONS_PATH = path.join(
  __dirname,
  '..',
  '..',
  'database',
  'migrations'
);

describe('QuestionnaireDrizzleRepository', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: NodePgDatabase<typeof schema>;
  let repository: QuestionnaireDrizzleRepository;

  const createTestUser = async (): Promise<string> => {
    const results = await db
      .insert(schema.users)
      .values({
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        passwordHash: 'hashed_password',
        displayName: 'Test User',
      })
      .returning();
    return results[0].id;
  };

  const validQuestionnaireData = (userId: string): NewQuestionnaire => ({
    userId,
    scalpCondition: 'seborrheic_dermatitis',
    sebumLevel: 'excessive',
    activeSymptoms: ['itching', 'yellow_scales'],
    hairStrandCondition: 'natural',
    ingredientTolerance: 'moderate',
  });

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

    repository = new QuestionnaireDrizzleRepository(db);
  }, 120000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  beforeEach(async () => {
    await db.delete(schema.questionnaires);
    await db.delete(schema.users);
  });

  describe('save', () => {
    it('should save a new questionnaire and return it with generated ID', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);

      const result = await repository.save(questionnaireData);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
      );
      expect(result.userId).toBe(userId);
      expect(result.scalpCondition).toBe('seborrheic_dermatitis');
      expect(result.sebumLevel).toBe('excessive');
      expect(result.activeSymptoms).toEqual(['itching', 'yellow_scales']);
      expect(result.hairStrandCondition).toBe('natural');
      expect(result.ingredientTolerance).toBe('moderate');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should store timestamps correctly', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);

      const result = await repository.save(questionnaireData);

      const createdAt = new Date(result.createdAt);
      const updatedAt = new Date(result.updatedAt);
      expect(createdAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('findByUserId', () => {
    it('should find questionnaire by userId', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);
      await repository.save(questionnaireData);

      const found = await repository.findByUserId(userId);

      expect(found).not.toBeNull();
      expect(found?.userId).toBe(userId);
      expect(found?.scalpCondition).toBe('seborrheic_dermatitis');
      expect(found?.sebumLevel).toBe('excessive');
      expect(found?.activeSymptoms).toEqual(['itching', 'yellow_scales']);
      expect(found?.hairStrandCondition).toBe('natural');
      expect(found?.ingredientTolerance).toBe('moderate');
    });

    it('should return null when no questionnaire exists for user', async () => {
      const userId = await createTestUser();

      const found = await repository.findByUserId(userId);

      expect(found).toBeNull();
    });

    it('should return null for non-existent user ID', async () => {
      const found = await repository.findByUserId(
        '00000000-0000-0000-0000-000000000000'
      );

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing questionnaire', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);
      const saved = await repository.save(questionnaireData);

      const updated = await repository.update(userId, {
        scalpCondition: 'psoriasis',
      });

      expect(updated.id).toBe(saved.id);
      expect(updated.scalpCondition).toBe('psoriasis');
      expect(updated.sebumLevel).toBe('excessive');
      expect(updated.activeSymptoms).toEqual(['itching', 'yellow_scales']);
    });

    it('should update multiple fields at once', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);
      await repository.save(questionnaireData);

      const updated = await repository.update(userId, {
        scalpCondition: 'psoriasis',
        sebumLevel: 'dry',
        activeSymptoms: ['redness', 'white_flakes'],
        hairStrandCondition: 'bleached',
        ingredientTolerance: 'hypoallergenic',
      });

      expect(updated.scalpCondition).toBe('psoriasis');
      expect(updated.sebumLevel).toBe('dry');
      expect(updated.activeSymptoms).toEqual(['redness', 'white_flakes']);
      expect(updated.hairStrandCondition).toBe('bleached');
      expect(updated.ingredientTolerance).toBe('hypoallergenic');
    });

    it('should update updatedAt timestamp', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);
      const saved = await repository.save(questionnaireData);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await repository.update(userId, {
        scalpCondition: 'psoriasis',
      });

      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
        new Date(saved.updatedAt).getTime()
      );
      expect(updated.createdAt).toBe(saved.createdAt);
    });
  });

  describe('unique userId constraint', () => {
    it('should enforce unique userId constraint', async () => {
      const userId = await createTestUser();
      const questionnaireData = validQuestionnaireData(userId);
      await repository.save(questionnaireData);

      const duplicateData = {
        ...questionnaireData,
        scalpCondition: 'psoriasis' as const,
      };

      await expect(repository.save(duplicateData)).rejects.toThrow();
    });
  });

  describe('activeSymptoms array', () => {
    it('should store and retrieve activeSymptoms array correctly', async () => {
      const userId = await createTestUser();
      const questionnaireData: NewQuestionnaire = {
        ...validQuestionnaireData(userId),
        activeSymptoms: [
          'itching',
          'redness',
          'yellow_scales',
          'white_flakes',
          'pain_burning',
        ],
      };
      await repository.save(questionnaireData);

      const found = await repository.findByUserId(userId);

      expect(found?.activeSymptoms).toEqual([
        'itching',
        'redness',
        'yellow_scales',
        'white_flakes',
        'pain_burning',
      ]);
    });

    it('should preserve order of activeSymptoms', async () => {
      const userId = await createTestUser();
      const questionnaireData: NewQuestionnaire = {
        ...validQuestionnaireData(userId),
        activeSymptoms: ['pain_burning', 'itching'],
      };
      await repository.save(questionnaireData);

      const found = await repository.findByUserId(userId);

      expect(found?.activeSymptoms).toEqual(['pain_burning', 'itching']);
    });

    it('should handle single symptom in array', async () => {
      const userId = await createTestUser();
      const questionnaireData: NewQuestionnaire = {
        ...validQuestionnaireData(userId),
        activeSymptoms: ['redness'],
      };
      await repository.save(questionnaireData);

      const found = await repository.findByUserId(userId);

      expect(found?.activeSymptoms).toEqual(['redness']);
    });
  });

  describe('enum values', () => {
    it('should store all valid scalp conditions', async () => {
      const scalpConditions: QuestionnaireProfile['scalpCondition'][] = [
        'seborrheic_dermatitis',
        'psoriasis',
        'atopic_dermatitis',
        'severe_dandruff',
        'sensitive_itchy',
      ];

      for (const scalpCondition of scalpConditions) {
        const userId = await createTestUser();
        const questionnaireData: NewQuestionnaire = {
          ...validQuestionnaireData(userId),
          scalpCondition,
        };

        const saved = await repository.save(questionnaireData);
        expect(saved.scalpCondition).toBe(scalpCondition);
      }
    });

    it('should store all valid sebum levels', async () => {
      const sebumLevels: QuestionnaireProfile['sebumLevel'][] = [
        'excessive',
        'moderate',
        'dry',
      ];

      for (const sebumLevel of sebumLevels) {
        const userId = await createTestUser();
        const questionnaireData: NewQuestionnaire = {
          ...validQuestionnaireData(userId),
          sebumLevel,
        };

        const saved = await repository.save(questionnaireData);
        expect(saved.sebumLevel).toBe(sebumLevel);
      }
    });

    it('should store all valid hair strand conditions', async () => {
      const hairStrandConditions: QuestionnaireProfile['hairStrandCondition'][] =
        ['natural', 'dyed', 'bleached'];

      for (const hairStrandCondition of hairStrandConditions) {
        const userId = await createTestUser();
        const questionnaireData: NewQuestionnaire = {
          ...validQuestionnaireData(userId),
          hairStrandCondition,
        };

        const saved = await repository.save(questionnaireData);
        expect(saved.hairStrandCondition).toBe(hairStrandCondition);
      }
    });

    it('should store all valid ingredient tolerances', async () => {
      const ingredientTolerances: QuestionnaireProfile['ingredientTolerance'][] =
        ['resilient', 'moderate', 'hypoallergenic'];

      for (const ingredientTolerance of ingredientTolerances) {
        const userId = await createTestUser();
        const questionnaireData: NewQuestionnaire = {
          ...validQuestionnaireData(userId),
          ingredientTolerance,
        };

        const saved = await repository.save(questionnaireData);
        expect(saved.ingredientTolerance).toBe(ingredientTolerance);
      }
    });
  });
});
