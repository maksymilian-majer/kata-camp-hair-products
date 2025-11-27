# NestJS 11 Clean Architecture

Patterns for NestJS 11 with Clean Architecture, dependency injection, and TypeScript.

## Architecture Principles

### Layer Structure

```
Controller → Service → Repository → Database
     ↓           ↓
   DTOs      Business Logic
```

**Key Principles:**

- Dependency flows inward: outer layers depend on inner layers
- Interfaces define contracts: services depend on interfaces, not implementations
- Business rules are isolated in the service layer
- Anemic domain model: DTOs are data containers, logic lives in services

### Module Organization

```
apps/api/src/
├── app/
│   ├── questionnaires/           # Feature module
│   │   ├── questionnaires.module.ts
│   │   ├── questionnaires.controller.ts
│   │   ├── surveyer.service.ts           # Interface
│   │   ├── surveyer.service-impl.ts      # Implementation
│   │   ├── questionnaire.repository.ts   # Interface
│   │   └── questionnaire.drizzle-repository.ts  # Implementation
│   └── app.module.ts             # Root module
├── database/
│   ├── schema.ts                 # Drizzle schema
│   └── migrations/               # Database migrations
└── shared/
    └── exceptions/               # Plain exceptions (not NestJS)
        └── validation.exception.ts

libs/shared/src/                  # Shared between FE and BE
├── types/                        # TypeScript interfaces
│   └── questionnaire.ts
└── schemas/                      # Zod validation schemas
    └── questionnaire.schema.ts
```

**Important**: Types and DTOs live in `libs/shared`, NOT in module folders. This enables sharing between frontend and backend.

## Interface Naming (No `I` Prefix)

```typescript
// ✅ GOOD: Plain interface name
export interface QuestionnaireRepository {
  findById(id: string): Promise<Questionnaire | null>;
  findByUserId(userId: string): Promise<Questionnaire | null>;
  create(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire>;
}

// Implementation adds technology suffix
export class QuestionnaireDrizzleRepository implements QuestionnaireRepository {}

// ❌ BAD: Hungarian notation
export interface IQuestionnaireRepository {}
```

## Dependency Injection

### Module Registration

```typescript
// questionnaires.module.ts
import { Module } from '@nestjs/common';
import { QuestionnairesController } from './questionnaires.controller';
import { SurveyerImpl } from './surveyer.service-impl';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { SURVEYER } from './surveyer.service';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
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

### Interface with Symbol Token

```typescript
// questionnaire.repository.ts
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

### Service Injection

```typescript
// surveyer.service-impl.ts
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
}
```

## Service Interfaces

### For CRUD Operations: Use Single Interface

For standard CRUD, use a single `*Manager` interface:

```typescript
// product.service.ts
import type { Product, CreateProductRequest, UpdateProductRequest } from '@hair-product-scanner/shared';

export interface ProductManager {
  getProduct(id: string): Promise<Product | null>;
  getProducts(filters: ProductFilters): Promise<Product[]>;
  createProduct(data: CreateProductRequest): Promise<Product>;
  updateProduct(id: string, data: UpdateProductRequest): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
}

export const PRODUCT_MANAGER = Symbol('PRODUCT_MANAGER');
```

### For Domain Operations: Use Actor-Focused Names

When operations don't fit CRUD, use expressive domain language:

```typescript
// surveyer.service.ts
import type { Questionnaire, CreateQuestionnaireRequest } from '@hair-product-scanner/shared';

export interface Surveyer {
  getQuestionnaire(userId: string): Promise<Questionnaire | null>;
  submitQuestionnaire(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire>;
  updateQuestionnaire(userId: string, data: Partial<CreateQuestionnaireRequest>): Promise<Questionnaire>;
  deleteQuestionnaire(userId: string): Promise<void>;
  hasCompletedSurvey(userId: string): Promise<boolean>;
}

export const SURVEYER = Symbol('SURVEYER');

// scan-analyzer.service.ts
export interface ProductScanAnalyzer {
  analyzeIngredients(ingredients: string[]): Promise<IngredientAnalysis>;
  matchWithProfile(analysis: IngredientAnalysis, profileId: string): Promise<CompatibilityResult>;
}

export const PRODUCT_SCAN_ANALYZER = Symbol('PRODUCT_SCAN_ANALYZER');
```

## Shared Types and Zod Validation

Types and validation schemas live in `libs/shared` for frontend/backend sharing.

### Shared Types

```typescript
// libs/shared/src/types/questionnaire.ts
export type HairType = 'straight' | 'wavy' | 'curly' | 'coily';

export type Questionnaire = {
  id: string;
  userId: string;
  hairType: HairType;
  concerns: string[];
  goals: string[];
  createdAt: string;
};

export type CreateQuestionnaireRequest = {
  hairType: HairType;
  concerns: string[];
  goals: string[];
};
```

### Zod Schemas for Validation

```typescript
// libs/shared/src/schemas/questionnaire.schema.ts
import { z } from 'zod';

export const hairTypeSchema = z.enum(['straight', 'wavy', 'curly', 'coily']);

export const createQuestionnaireSchema = z.object({
  hairType: hairTypeSchema,
  concerns: z.array(z.string()).min(1, 'Select at least one concern'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
});

export type CreateQuestionnaireRequest = z.infer<typeof createQuestionnaireSchema>;
```

### NestJS Zod Validation Pipe

See: [NestJS Object Schema Validation](https://docs.nestjs.com/pipes#object-schema-validation)

```typescript
// shared/pipes/zod-validation.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return result.data;
  }
}
```

### Controller with Zod Validation

```typescript
// questionnaires.controller.ts
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { createQuestionnaireSchema } from '@hair-product-scanner/shared/schemas';
import { ZodValidationPipe } from '@/api/shared/pipes';
import type { CreateQuestionnaireRequest } from '@hair-product-scanner/shared';

@Controller('api/questionnaires')
export class QuestionnairesController {
  @Post()
  @UsePipes(new ZodValidationPipe(createQuestionnaireSchema))
  async submit(@Body() data: CreateQuestionnaireRequest) {
    // data is already validated by Zod
  }
}
```

## Error Handling

### ValidationException (Plain Error)

Services throw plain errors, NOT NestJS HTTP exceptions. See `business-logic` skill for details.

```typescript
// shared/exceptions/validation.exception.ts
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
}
```

### Controller Maps Errors to HTTP

Controllers catch `ValidationException` and map to NestJS HTTP exceptions:

```typescript
// questionnaires.controller.ts
import { Controller, Get, Post, Body, Req, Inject, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ValidationException } from '@/api/shared/exceptions';
import type { Request } from 'express';

@Controller('api/questionnaires')
export class QuestionnairesController {
  constructor(
    @Inject(SURVEYER)
    private readonly surveyer: Surveyer
  ) {}

  @Get()
  async get(@Req() req: Request) {
    const questionnaire = await this.surveyer.getQuestionnaire(req.user!.id);
    if (!questionnaire) {
      throw new NotFoundException('Questionnaire not found');
    }
    return questionnaire;
  }

  @Post()
  async submit(@Req() req: Request, @Body() data: CreateQuestionnaireRequest) {
    try {
      return await this.surveyer.submitQuestionnaire(req.user!.id, data);
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
        case 'INVALID_STATE':
        case 'BUSINESS_RULE_VIOLATION':
          return new BadRequestException(error.message);
      }
    }
    throw error;
  }
}
```

## Service Layer Patterns

### Business Logic in Services

Services contain business rules that Zod can't express:

```typescript
@Injectable()
export class SurveyerImpl implements Surveyer {
  async submitQuestionnaire(userId: string, data: CreateQuestionnaireRequest): Promise<Questionnaire> {
    // Check for existing (business rule: one per user)
    const existing = await this.repository.findByUserId(userId);
    if (existing) {
      throw ValidationException.conflict('User already has a questionnaire');
    }

    // Business rule: mutually exclusive hair types
    if (data.hairTypes?.includes('curly') && data.hairTypes?.includes('straight')) {
      throw ValidationException.businessRule('Cannot select both curly and straight hair types');
    }

    return this.repository.create(userId, data);
  }
}
```

### Validation Summary

| Validation Type | Where           | Example                                          |
| --------------- | --------------- | ------------------------------------------------ |
| Schema (Zod)    | Controller/Pipe | Required fields, string length, email format     |
| Business Logic  | Service         | "Can't select both curly AND straight hair type" |

## CQRS Pattern

Use NestJS CQRS for clean separation of reads and writes. See: https://docs.nestjs.com/recipes/cqrs

### Installation

```bash
pnpm add @nestjs/cqrs
```

### When to Use CQRS

| Pattern          | Use Case                                   |
| ---------------- | ------------------------------------------ |
| Standard Service | Simple CRUD operations                     |
| CQRS Queries     | BFF read operations, complex aggregations  |
| CQRS Commands    | Complex write operations with side effects |

### Query Definition

```typescript
// queries/get-user-dashboard.query.ts
export class GetUserDashboardQuery {
  constructor(public readonly userId: string) {}
}
```

### Query Handler

```typescript
// queries/get-user-dashboard.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '@/api/database/drizzle.provider';
import { GetUserDashboardQuery } from './get-user-dashboard.query';
import type { DashboardResponse } from '@hair-product-scanner/shared/bff';

@QueryHandler(GetUserDashboardQuery)
export class GetUserDashboardHandler implements IQueryHandler<GetUserDashboardQuery> {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async execute(query: GetUserDashboardQuery): Promise<DashboardResponse> {
    const { userId } = query;

    // Direct Drizzle access for efficient queries
    const [stats] = await this.db
      .select({
        totalScans: count(scans.id),
        averageScore: avg(scans.score),
      })
      .from(scans)
      .where(eq(scans.userId, userId));

    return {
      stats: {
        totalScans: stats.totalScans,
        averageScore: stats.averageScore ? Math.round(stats.averageScore) : null,
      },
    };
  }
}
```

### Command Definition

```typescript
// commands/analyze-product.command.ts
export class AnalyzeProductCommand {
  constructor(
    public readonly userId: string,
    public readonly ingredients: string[]
  ) {}
}
```

### Command Handler

```typescript
// commands/analyze-product.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AnalyzeProductCommand } from './analyze-product.command';
import { ProductScanAnalyzer, PRODUCT_SCAN_ANALYZER } from '../services/scan-analyzer.service';

@CommandHandler(AnalyzeProductCommand)
export class AnalyzeProductHandler implements ICommandHandler<AnalyzeProductCommand> {
  constructor(
    @Inject(PRODUCT_SCAN_ANALYZER)
    private readonly analyzer: ProductScanAnalyzer
  ) {}

  async execute(command: AnalyzeProductCommand): Promise<AnalysisResult> {
    const { userId, ingredients } = command;
    return this.analyzer.analyzeIngredients(userId, ingredients);
  }
}
```

### Controller with QueryBus/CommandBus

```typescript
// dashboard.controller.ts
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { GetUserDashboardQuery } from './queries/get-user-dashboard.query';
import { AnalyzeProductCommand } from './commands/analyze-product.command';

@Controller('api/dashboard')
export class DashboardController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get()
  async getDashboard(@Req() req: Request) {
    return this.queryBus.execute(new GetUserDashboardQuery(req.user!.id));
  }

  @Post('analyze')
  async analyzeProduct(@Req() req: Request, @Body() data: AnalyzeRequest) {
    return this.commandBus.execute(new AnalyzeProductCommand(req.user!.id, data.ingredients));
  }
}
```

### Module with CQRS

```typescript
// dashboard.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '@/api/database/database.module';
import { DashboardController } from './dashboard.controller';
import { GetUserDashboardHandler } from './queries/get-user-dashboard.handler';
import { AnalyzeProductHandler } from './commands/analyze-product.handler';

const QueryHandlers = [GetUserDashboardHandler];
const CommandHandlers = [AnalyzeProductHandler];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [DashboardController],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class DashboardModule {}
```

### CQRS File Organization

```
apps/api/src/app/
└── dashboard/
    ├── dashboard.module.ts
    ├── dashboard.controller.ts
    ├── queries/
    │   ├── get-user-dashboard.query.ts
    │   └── get-user-dashboard.handler.ts
    └── commands/
        ├── analyze-product.command.ts
        └── analyze-product.handler.ts
```

## Best Practices

### DO:

- Keep types in `libs/shared` for frontend/backend sharing
- Use Zod for schema validation (shared between FE/BE)
- Use Symbol tokens for DI (`SURVEYER`, `QUESTIONNAIRE_REPOSITORY`)
- Services throw plain `ValidationException`
- Controllers map exceptions to HTTP status codes
- Use actor-focused interface names (`Surveyer`, `ProductScanAnalyzer`)
- Use CQRS for BFF reads and complex operations
- Query handlers access Drizzle directly for efficient queries

### DON'T:

- Create `dto/` or `interfaces/` folders in modules
- Prefix interfaces with `I` (`IUserRepository`)
- Use class-validator/class-transformer
- Have services throw NestJS HttpException
- Split CRUD into Reader/Writer/Deleter interfaces
- Put business logic in controllers
- Use CQRS for simple CRUD (overkill)

### File Organization

Each feature module should have:

- `*.module.ts` - Module definition
- `*.controller.ts` - HTTP handlers (thin, maps errors)
- `*.service.ts` - Service interface
- `*.service-impl.ts` - Service implementation (business logic)
- `*.repository.ts` - Repository interface
- `*.drizzle-repository.ts` - Repository implementation

Types and schemas live in `libs/shared/src/`:

- `types/*.ts` - TypeScript interfaces
- `schemas/*.ts` - Zod validation schemas
