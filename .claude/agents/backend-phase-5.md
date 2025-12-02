---
name: backend-phase-5
description: |
  Phase 5: Service Layer with TDD. Write unit tests FIRST with mocked repositories,
  then implement NestJS services with business logic. Tests must pass before completion.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nestjs-architecture
  - business-logic
  - vitest-testing
---

# Phase 5: Service Layer (TDD)

Build business logic services with test-first development. Write unit tests with mocked repositories BEFORE implementing services.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { Surveyer } from './surveyer.service'`)
- **Parent/other folders**: Use `@/api/` alias (e.g., `import { ValidationException } from '@/api/shared/exceptions'`)
- **Shared libs**: Use package imports (e.g., `import type { Questionnaire } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/api/` alias

## TDD Flow

```
1. Write test → 2. Run test (FAIL) → 3. Implement → 4. Run test (PASS)
```

**You MUST follow this order. No implementing before tests exist.**

## What You Build

- Service interface
- Service implementation with business logic
- Unit tests with mocked repositories
- DTO transformations

## What You DON'T Build

- No HTTP endpoints (Phase 6)
- No database access (that's repository's job)
- No new repository methods (Phase 4)

## File Organization

```
apps/api/src/modules/
└── questionnaires/
    ├── surveyer.service.ts                   # Interface (expressive actor name)
    ├── surveyer.service-impl.ts              # Implementation
    └── surveyer.service.spec.ts              # Unit tests

apps/api/src/shared/
└── exceptions/
    └── validation.exception.ts               # Custom exception (not NestJS)
```

**Types**: Reuse types from `@hair-product-scanner/shared` - do NOT create dto/ folders in modules.

**Domain Model (optional)**: Only create `questionnaire.model.ts` if the domain needs expressiveness beyond shared DTOs (e.g., computed properties, business methods).

## Step 1: Define Service Interface

Use expressive, actor-focused names that communicate what the actor does. Since we're surveying users about their hair goals, we call this service `Surveyer`.

```typescript
// apps/api/src/modules/questionnaires/surveyer.service.ts
import type { Questionnaire, CreateQuestionnaireRequest } from '@hair-product-scanner/shared';

export interface Surveyer {
  getQuestionnaire(userId: string): Promise<Questionnaire | null>;
  submitQuestionnaire(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire>;
  updateQuestionnaire(userId: string, data: Partial<CreateQuestionnaireRequest>): Promise<Questionnaire>;
  deleteQuestionnaire(userId: string): Promise<void>;
  hasCompletedSurvey(userId: string): Promise<boolean>;
}

export const SURVEYER = Symbol('SURVEYER');
```

## Step 2: Write Tests FIRST

```typescript
// apps/api/src/modules/questionnaires/surveyer.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SurveyerImpl } from './surveyer.service-impl';
import { ValidationException } from '@/api/shared/exceptions';
import type { QuestionnaireRepository } from './questionnaire.repository';
import type { Questionnaire } from '@hair-product-scanner/shared';

describe('SurveyerImpl', () => {
  let surveyer: SurveyerImpl;
  let mockRepository: QuestionnaireRepository;

  const mockQuestionnaire: Questionnaire = {
    id: 'questionnaire-1',
    userId: 'user-1',
    hairType: 'curly',
    concerns: ['frizz', 'dryness'],
    goals: ['moisturize'],
    createdAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    surveyer = new SurveyerImpl(mockRepository);
  });

  describe('getQuestionnaire', () => {
    it('returns questionnaire when found', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockQuestionnaire);

      const result = await surveyer.getQuestionnaire('user-1');

      expect(result).toEqual(mockQuestionnaire);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('returns null when not found', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      const result = await surveyer.getQuestionnaire('user-1');

      expect(result).toBeNull();
    });
  });

  describe('submitQuestionnaire', () => {
    it('submits questionnaire when user has none', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue(mockQuestionnaire);

      const result = await surveyer.submitQuestionnaire('user-1', {
        hairType: 'curly',
        concerns: ['frizz', 'dryness'],
        goals: ['moisturize'],
      });

      expect(result).toEqual(mockQuestionnaire);
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('throws ValidationException when questionnaire exists', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockQuestionnaire);

      await expect(
        surveyer.submitQuestionnaire('user-1', {
          hairType: 'curly',
          concerns: [],
          goals: [],
        })
      ).rejects.toThrow(ValidationException);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateQuestionnaire', () => {
    it('updates existing questionnaire', async () => {
      const updatedQuestionnaire = { ...mockQuestionnaire, concerns: ['frizz', 'dryness', 'damage'] };
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockQuestionnaire);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedQuestionnaire);

      const result = await surveyer.updateQuestionnaire('user-1', {
        concerns: ['frizz', 'dryness', 'damage'],
      });

      expect(result.concerns).toContain('damage');
      expect(mockRepository.update).toHaveBeenCalledWith(mockQuestionnaire.id, {
        concerns: ['frizz', 'dryness', 'damage'],
      });
    });

    it('throws ValidationException when questionnaire does not exist', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      await expect(surveyer.updateQuestionnaire('user-1', { concerns: [] })).rejects.toThrow(ValidationException);
    });
  });

  describe('deleteQuestionnaire', () => {
    it('deletes existing questionnaire', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockQuestionnaire);
      vi.mocked(mockRepository.delete).mockResolvedValue(undefined);

      await surveyer.deleteQuestionnaire('user-1');

      expect(mockRepository.delete).toHaveBeenCalledWith(mockQuestionnaire.id);
    });

    it('throws ValidationException when questionnaire does not exist', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      await expect(surveyer.deleteQuestionnaire('user-1')).rejects.toThrow(ValidationException);
    });
  });

  describe('hasCompletedSurvey', () => {
    it('returns true when questionnaire exists', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockQuestionnaire);

      const result = await surveyer.hasCompletedSurvey('user-1');

      expect(result).toBe(true);
    });

    it('returns false when questionnaire does not exist', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      const result = await surveyer.hasCompletedSurvey('user-1');

      expect(result).toBe(false);
    });
  });
});
```

## Step 3: Run Tests (Expect FAIL)

```bash
pnpm nx test api --testPathPattern=surveyer
```

Tests should fail because the Surveyer doesn't exist yet.

## Step 4: Create ValidationException

Services should NOT throw NestJS exceptions. Create a custom exception in `apps/api/src/shared/`:

```typescript
// apps/api/src/shared/exceptions/validation.exception.ts
export type ValidationErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'INVALID_INPUT';

export class ValidationException extends Error {
  constructor(
    public readonly code: ValidationErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ValidationException';
  }

  static notFound(message: string): ValidationException {
    return new ValidationException('NOT_FOUND', message);
  }

  static conflict(message: string): ValidationException {
    return new ValidationException('CONFLICT', message);
  }

  static invalidInput(message: string): ValidationException {
    return new ValidationException('INVALID_INPUT', message);
  }
}
```

```typescript
// apps/api/src/shared/exceptions/index.ts
export * from './validation.exception';
```

## Step 5: Implement Service

```typescript
// apps/api/src/modules/questionnaires/surveyer.service-impl.ts
import { Injectable, Inject } from '@nestjs/common';
import type { Questionnaire, CreateQuestionnaireRequest } from '@hair-product-scanner/shared';
import { ValidationException } from '@/api/shared/exceptions';
import { QuestionnaireRepository, QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { Surveyer } from './surveyer.service';

@Injectable()
export class SurveyerImpl implements Surveyer {
  constructor(
    @Inject(QUESTIONNAIRE_REPOSITORY)
    private readonly repository: QuestionnaireRepository
  ) {}

  async getQuestionnaire(userId: string): Promise<Questionnaire | null> {
    return this.repository.findByUserId(userId);
  }

  async submitQuestionnaire(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire> {
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw ValidationException.conflict('User already has a questionnaire');
    }

    return this.repository.create(userId, data);
  }

  async updateQuestionnaire(userId: string, data: Partial<CreateQuestionnaireRequest>): Promise<Questionnaire> {
    const questionnaire = await this.repository.findByUserId(userId);
    if (!questionnaire) {
      throw ValidationException.notFound('Questionnaire not found');
    }

    return this.repository.update(questionnaire.id, data);
  }

  async deleteQuestionnaire(userId: string): Promise<void> {
    const questionnaire = await this.repository.findByUserId(userId);
    if (!questionnaire) {
      throw ValidationException.notFound('Questionnaire not found');
    }

    await this.repository.delete(questionnaire.id);
  }

  async hasCompletedSurvey(userId: string): Promise<boolean> {
    const questionnaire = await this.repository.findByUserId(userId);
    return questionnaire !== null;
  }
}
```

## Step 6: Run Tests (Expect PASS)

```bash
pnpm nx test api --testPathPattern=surveyer
```

All tests should now pass.

## Step 7: Update Module

```typescript
// apps/api/src/modules/questionnaires/questionnaires.module.ts
import { Module } from '@nestjs/common';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { SurveyerImpl } from './surveyer.service-impl';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { SURVEYER } from './surveyer.service';
import { DatabaseModule } from '@/api/database/database.module';

@Module({
  imports: [DatabaseModule],
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

## Completion Checklist

- [ ] Tests written FIRST with mocked repository
- [ ] Tests initially FAIL
- [ ] Service implemented with business logic
- [ ] ValidationException created in `@/api/shared/exceptions`
- [ ] All tests PASS
- [ ] Module updated with service provider
- [ ] `pnpm check-all` passes
