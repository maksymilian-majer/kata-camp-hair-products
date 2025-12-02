# Service Layer Business Logic Patterns

Patterns for implementing business logic in the NestJS service layer following an anemic domain model.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { Surveyer } from './surveyer.interface'`)
- **Parent/other folders**: Use `@/api/` alias (e.g., `import { ValidationException } from '@/api/shared/exceptions'`)
- **Shared libs**: Use package imports (e.g., `import type { User } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/api/` alias

## Architecture Philosophy

This project uses **Anemic Domain Model** (not DDD):

- Simple data transfer objects (DTOs)
- Business logic in service layer, not domain objects
- No domain events or aggregates
- No value objects or entities with behavior
- Explicit, straightforward code

**Reference**: See `docs/001-KATA-CAMP-PLAN.md` for architecture decisions.

### Layer Responsibilities

```
Controller → Service → Repository → Database
     ↓           ↓
   DTOs      Business Logic
```

- **Controller**: HTTP handling, Zod schema validation (via pipes), response formatting
- **Service**: Business rules, domain logic validation, orchestration
- **Repository**: Data access, queries, persistence
- **DTOs**: Data containers, no logic

### Schema vs Business Logic Validation

| Validation Type | Where           | Example                                          |
| --------------- | --------------- | ------------------------------------------------ |
| Schema (Zod)    | Controller/Pipe | Required fields, string length, email format     |
| Business Logic  | Service         | "Can't select both curly AND straight hair type" |

Zod handles **schema validation** - see [NestJS Object Schema Validation](https://docs.nestjs.com/pipes#object-schema-validation).

Services handle **business rules** - domain-specific constraints that require context or database lookups.

## Interface Naming (No `I` Prefix)

```typescript
// ✅ GOOD: Plain interface name
export interface UserRepository {
  findById(id: string): Promise<User | null>;
}

// Implementation adds technology suffix
export class UserDrizzleRepository implements UserRepository {}
export class UserAuth0Repository implements UserRepository {}

// ❌ BAD: Hungarian notation
export interface IUserRepository {}
```

## Actor-Focused Interfaces

Design interfaces that express what the actor does:

```typescript
// quiz.service.interface.ts

// For questionnaire operations
export interface Surveyer {
  startQuiz(userId: string): Promise<QuizSession>;
  submitAnswer(sessionId: string, questionId: string, answer: string): Promise<void>;
  completeQuiz(sessionId: string): Promise<QuizResult>;
}

// For product analysis
export interface ProductScanAnalyzer {
  analyzeIngredients(ingredients: string[]): Promise<IngredientAnalysis>;
  matchWithProfile(analysis: IngredientAnalysis, profileId: string): Promise<CompatibilityResult>;
}

// Standard CRUD
export interface QuizReader {
  getQuiz(id: string): Promise<Quiz>;
}

export interface QuizWriter {
  createQuiz(data: CreateQuizDto): Promise<Quiz>;
}
```

## ValidationException (Plain Error)

Services throw plain errors, NOT NestJS HTTP exceptions. The controller maps errors to HTTP responses.

```typescript
// common/exceptions/validation.exception.ts
export type ValidationErrorCode = 'NOT_FOUND' | 'CONFLICT' | 'INVALID_STATE' | 'BUSINESS_RULE_VIOLATION';

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

  static invalidState(message: string): ValidationException {
    return new ValidationException('INVALID_STATE', message);
  }

  static businessRule(message: string): ValidationException {
    return new ValidationException('BUSINESS_RULE_VIOLATION', message);
  }
}
```

**Why not extend HttpException?**

- Service layer shouldn't depend on HTTP/NestJS
- Same service can be used in CLI, queue workers, etc.
- Controller is responsible for HTTP mapping

## Business Logic Examples

### Mutually Exclusive Options

```typescript
// Service validates domain rules that Zod can't express
async submitQuestionnaire(userId: string, data: CreateQuestionnaireDto): Promise<Questionnaire> {
  // Zod already validated: required fields, array types, enum values
  // Service validates: business rules

  // Business rule: Can't select both curly AND straight
  if (data.hairTypes.includes('curly') && data.hairTypes.includes('straight')) {
    throw ValidationException.businessRule(
      'Cannot select both curly and straight hair types',
    );
  }

  // Business rule: Some concerns are mutually exclusive
  const hasOily = data.concerns.includes('oily-scalp');
  const hasDry = data.concerns.includes('dry-scalp');
  if (hasOily && hasDry) {
    throw ValidationException.businessRule(
      'Oily scalp and dry scalp are mutually exclusive',
    );
  }

  return this.repository.create(userId, data);
}
```

### State-Based Rules

```typescript
// Business rule: Can only start new quiz after cooldown
async startQuiz(userId: string): Promise<QuizSession> {
  const existingSession = await this.repository.findLatestSession(userId);

  const { allowed, reason } = this.canStartNewQuiz(existingSession);
  if (!allowed) {
    throw ValidationException.invalidState(reason);
  }

  return this.repository.createSession({ userId, startedAt: new Date() });
}

private canStartNewQuiz(
  existingSession: QuizSession | null,
): { allowed: boolean; reason?: string } {
  if (!existingSession) {
    return { allowed: true };
  }

  if (!existingSession.completedAt) {
    return {
      allowed: false,
      reason: 'Complete or abandon current quiz first',
    };
  }

  const hoursSinceCompletion = this.getHoursSince(existingSession.completedAt);
  const cooldownHours = 24;

  if (hoursSinceCompletion < cooldownHours) {
    const remaining = Math.ceil(cooldownHours - hoursSinceCompletion);
    return {
      allowed: false,
      reason: `Please wait ${remaining} hours before starting a new quiz`,
    };
  }

  return { allowed: true };
}
```

### Cross-Entity Validation

```typescript
// Business rule: Product can only be favorited if user has scanned it
async addToFavorites(userId: string, productId: string): Promise<void> {
  // Check if user has scanned this product
  const scan = await this.scanRepository.findByUserAndProduct(userId, productId);
  if (!scan) {
    throw ValidationException.businessRule(
      'You can only favorite products you have scanned',
    );
  }

  // Check if already favorited
  const existing = await this.favoriteRepository.find(userId, productId);
  if (existing) {
    throw ValidationException.conflict('Product already in favorites');
  }

  await this.favoriteRepository.create(userId, productId);
}
```

### Resource Existence

```typescript
async getQuestionnaire(userId: string): Promise<Questionnaire> {
  const questionnaire = await this.repository.findByUserId(userId);
  if (!questionnaire) {
    throw ValidationException.notFound('Questionnaire not found');
  }
  return questionnaire;
}
```

## Service Implementation

```typescript
// surveyer.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Surveyer } from './surveyer.interface';
import { QuestionnaireRepository, QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { ValidationException } from '@/api/shared/exceptions';
import type { Questionnaire, CreateQuestionnaireDto } from '@hair-product-scanner/shared';

@Injectable()
export class SurveyerService implements Surveyer {
  constructor(
    @Inject(QUESTIONNAIRE_REPOSITORY)
    private readonly repository: QuestionnaireRepository
  ) {}

  async getQuestionnaire(userId: string): Promise<Questionnaire | null> {
    return this.repository.findByUserId(userId);
  }

  async submitQuestionnaire(userId: string, data: CreateQuestionnaireDto): Promise<Questionnaire> {
    // Check for existing (business rule: one per user)
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw ValidationException.conflict('User already has a questionnaire');
    }

    // Validate business rules
    this.validateHairTypeRules(data);
    this.validateConcernRules(data);

    return this.repository.create(userId, data);
  }

  private validateHairTypeRules(data: CreateQuestionnaireDto): void {
    // Mutually exclusive hair types
    const incompatible = [
      ['curly', 'straight'],
      ['coily', 'straight'],
    ];

    for (const [a, b] of incompatible) {
      if (data.hairTypes?.includes(a) && data.hairTypes?.includes(b)) {
        throw ValidationException.businessRule(`Cannot select both ${a} and ${b} hair types`);
      }
    }
  }

  private validateConcernRules(data: CreateQuestionnaireDto): void {
    const mutuallyExclusive = [
      ['oily-scalp', 'dry-scalp'],
      ['fine-hair', 'thick-hair'],
    ];

    for (const [a, b] of mutuallyExclusive) {
      if (data.concerns?.includes(a) && data.concerns?.includes(b)) {
        throw ValidationException.businessRule(`${a} and ${b} are mutually exclusive`);
      }
    }
  }
}
```

## Controller Maps Errors to HTTP

```typescript
// questionnaires.controller.ts
import { Controller, Get, Post, Body, Req, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ValidationException } from '@/api/shared/exceptions';

@Controller('api/questionnaires')
export class QuestionnairesController {
  constructor(private readonly surveyer: SurveyerService) {}

  @Post()
  async submit(@Req() req: Request, @Body() data: CreateQuestionnaireDto) {
    try {
      return await this.surveyer.submitQuestionnaire(req.user.id, data);
    } catch (error) {
      throw this.mapToHttpError(error);
    }
  }

  private mapToHttpError(error: unknown): Error {
    if (error instanceof ValidationException) {
      switch (error.code) {
        case 'NOT_FOUND':
          return new NotFoundException(error.message);
        case 'CONFLICT':
          return new ConflictException(error.message);
        case 'INVALID_STATE':
        case 'BUSINESS_RULE_VIOLATION':
          return new BadRequestException(error.message);
      }
    }
    throw error; // Re-throw unknown errors
  }
}
```

## Unit Testing with Mocks

```typescript
// surveyer.service.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SurveyerService } from './surveyer.service';
import { ValidationException } from '@/api/shared/exceptions';

describe('SurveyerService', () => {
  let service: SurveyerService;
  let mockRepository: QuestionnaireRepository;

  beforeEach(() => {
    mockRepository = {
      findByUserId: vi.fn(),
      create: vi.fn(),
    };
    service = new SurveyerService(mockRepository);
  });

  describe('submitQuestionnaire', () => {
    it('throws CONFLICT when user already has questionnaire', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue({ id: '1' });

      await expect(service.submitQuestionnaire('user-1', { hairType: 'curly', concerns: [] })).rejects.toThrow(ValidationException);
    });

    it('throws BUSINESS_RULE_VIOLATION for incompatible hair types', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      await expect(
        service.submitQuestionnaire('user-1', {
          hairTypes: ['curly', 'straight'], // Invalid combination
          concerns: [],
        })
      ).rejects.toThrow('Cannot select both curly and straight');
    });

    it('throws BUSINESS_RULE_VIOLATION for mutually exclusive concerns', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      await expect(
        service.submitQuestionnaire('user-1', {
          hairType: 'curly',
          concerns: ['oily-scalp', 'dry-scalp'], // Mutually exclusive
        })
      ).rejects.toThrow('mutually exclusive');
    });

    it('creates questionnaire when all rules pass', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(mockRepository.create).mockResolvedValue({ id: '1', hairType: 'curly' });

      const result = await service.submitQuestionnaire('user-1', {
        hairType: 'curly',
        concerns: ['frizz'],
      });

      expect(result.id).toBe('1');
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe('canStartNewQuiz', () => {
    it('allows when no existing session', () => {
      const result = service['canStartNewQuiz'](null);
      expect(result.allowed).toBe(true);
    });

    it('blocks when session is incomplete', () => {
      const session = { completedAt: null };
      const result = service['canStartNewQuiz'](session as any);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Complete or abandon');
    });

    it('blocks during cooldown period', () => {
      const session = {
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      };
      const result = service['canStartNewQuiz'](session as any);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('wait');
    });
  });
});
```

## Summary

| What               | Where      | Example                                 |
| ------------------ | ---------- | --------------------------------------- |
| Required fields    | Zod schema | `hairType: z.string().min(1)`           |
| Enum values        | Zod schema | `z.enum(['curly', 'wavy', 'straight'])` |
| String format      | Zod schema | `email: z.string().email()`             |
| Mutually exclusive | Service    | "Can't have oily AND dry scalp"         |
| State transitions  | Service    | "Can't start quiz during cooldown"      |
| Cross-entity rules | Service    | "Can only favorite scanned products"    |
| Resource existence | Service    | "Questionnaire not found"               |
