# Training Requirements Document: Kata Camp - Rapid AI Product Delivery

**Session:** Rapid AI product delivery - from prototype to production
**Speaker:** Maksymilian Majer
**Duration:** 1 hour 30 minutes
**Last Updated:** 2025-01-24

---

## 1. Executive Summary

This training teaches developers how to rapidly deliver production-ready AI-powered applications using a structured 7-phase workflow. Participants will build a "Hair Product Scanner" application that uses LLMs to analyze scanned product labels and compare them against user hair preferences.

### Training Flow

```
Lovable.dev (Prototype) → Claude Code (Implementation) → Production-Ready App
```

### Key Outcomes

- Prototype collaboratively with stakeholders using Lovable.dev
- Transform prototypes into production code using AI-assisted development
- Apply BDD-driven test scenarios throughout the delivery process
- Master inside-out TDD for backend development
- Write meaningful integration tests for frontend (routing, user flows)

---

## 2. Prerequisites

### Required Tools & Accounts

| Tool | Purpose | Setup |
|------|---------|-------|
| Claude Code Pro | AI-assisted coding | Subscription required |
| Lovable.dev | Rapid prototyping | Free account |
| Node.js 22+ | Runtime | Pre-installed |
| Docker | Database & testing | Pre-installed |
| Git | Version control | Pre-installed |

### Provided Materials

- **Starter Repository**: Nx monorepo with Next.js + NestJS pre-configured
- **Lovable Prototype**: Basic design system and responsive web app skeleton

### Participant Skills

- Intermediate JavaScript/TypeScript knowledge
- Basic understanding of React concepts
- Familiarity with REST APIs
- Command line comfort

---

## 3. Technology Stack

### Stack Decisions (Final)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Monorepo** | Nx 22 | Intelligent caching, parallel execution, mature ecosystem |
| **Frontend** | Next.js 16 | Better AI knowledge, more documentation, mature Nx plugin |
| **Backend** | NestJS 11 | Structured architecture, matches Go Clean Architecture patterns |
| **ORM** | Drizzle | SQL-like syntax (similar to Go), fast, type-safe |
| **Styling** | Tailwind 4.1 | Latest features, excellent AI support |
| **Server State** | TanStack Query | Caching, refetching, optimistic updates |
| **Client State** | Zustand | Simple, fast, minimal boilerplate |
| **Testing** | Vitest | 2-3x faster, ESM native, official support in both NestJS 11 and Next.js |
| **DB Testing** | Testcontainers | Real PostgreSQL in tests, same as Go approach |

### Why Next.js over React Router 7?

| Factor | Next.js 16 | React Router 7 |
|--------|-----------|----------------|
| **AI Knowledge** | Excellent - tons of training data | Limited - very new |
| **Documentation** | Extensive | Still evolving |
| **Nx Integration** | Mature plugin | Newer plugin |
| **Post-kata learning** | More resources for participants | Fewer examples |

**Decision**: Next.js 16 - AI assistants know it better, participants can find more resources after.

> Note: Next.js has API routes which overlap with NestJS, but we prefer NestJS for its structured architecture that mirrors Go Clean Architecture. We'll simply not use Next.js API routes.

### Why Vitest over Jest?

| Factor | Vitest | Jest |
|--------|--------|------|
| **Speed** | 2-3x faster | Baseline |.
| **ESM** | Native | Requires config |
| **NestJS 11** | [Official recipe](https://docs.nestjs.com/recipes/swc) | Native |
| **Next.js** | [Official guide](https://nextjs.org/docs/app/guides/testing/vitest) | Needs config |

**Decision**: Vitest - faster feedback loop for kata, official support in both frameworks.

> Risk mitigation: Starter repo will have Vitest fully configured and tested.

### Why Drizzle over TypeORM/Prisma?

```typescript
// Drizzle - SQL-like, similar to Go raw SQL approach
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.hairType, 'curly'));

// vs TypeORM - ORM abstraction
const products = await productRepository.find({
  where: { hairType: 'curly' }
});
```

**Decision**: Drizzle - closest to our Go philosophy of writing explicit SQL, fastest ORM, excellent type inference.

### Stack Components

```
┌─────────────────────────────────────────────────────────────┐
│                       Nx 22 Monorepo                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (apps/web)        │  Backend (apps/api)           │
│  ───────────────────────    │  ────────────────────         │
│  • Next.js 16 (App Router)  │  • NestJS 11 + SWC            │
│  • React 19                 │  • Drizzle ORM                │
│  • TanStack Query v5        │  • PostgreSQL                 │
│  • Zustand                  │  • OpenAI SDK                 │
│  • Tailwind 4.1             │  • Vitest + Supertest         │
│  • Vitest + RTL             │  • Testcontainers             │
├─────────────────────────────────────────────────────────────┤
│  Shared (libs/shared)                                       │
│  • API contracts (types)                                    │
│  • Validation schemas (zod)                                 │
│  • Common utilities                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture: Go Clean Architecture in TypeScript

### Architecture Philosophy: Anemic Domain (Not DDD)

This project intentionally uses an **anemic domain model**, not Domain-Driven Design. The domain is simple enough that rich domain objects with behavior would be over-engineering.

**What this means:**
- **Domain types** = Data structures (interfaces/types) returned from repositories
- **Business logic** = Lives in services, not in domain objects
- **No aggregates, entities, or value objects** in the DDD sense
- **Repositories** = Data access returning typed data, not domain entities with behavior

This matches how we use Go Clean Architecture for simpler domains - the "model" layer contains data structures, and services contain the logic.

### Layer Mapping

The NestJS backend follows the same one-directional layer pattern as our Go Clean Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Go Clean Architecture    →    NestJS Equivalent            │
├─────────────────────────────────────────────────────────────┤
│  HTTP Handler (Chi)       →    Controller (NestJS)          │
│  Service Interface        →    Service Interface (abstract) │
│  Service Implementation   →    Service (Injectable)         │
│  Repository Interface     →    Repository Interface         │
│  Repository (SQL)         →    Repository (Drizzle)         │
│  Domain Models            →    Domain Models (classes/types)│
└─────────────────────────────────────────────────────────────┘
```

### Dependency Flow (Same as Go)

```
Controller → Service → Repository → Drizzle (SQL)
     ↓           ↓          ↓
  HTTP DTOs   Domain    SQL Schema
```

**Key Principle**: Dependencies flow inward. Controllers depend on Services, Services depend on Repositories. Never the reverse.

### Example: Questionnaire Module Structure

```typescript
// apps/api/src/modules/questionnaires/
├── questionnaires.controller.ts    // HTTP Handler - returns shared types
├── questionnaires.service.ts       // Service - business logic
├── questionnaires.repository.ts    // Repository - data access with Drizzle
├── questionnaires.module.ts        // NestJS module wiring
├── domain/
│   └── questionnaire.ts            // Domain types (anemic - just data structures)
└── __tests__/
    ├── questionnaires.repository.spec.ts  // Integration tests (testcontainers)
    ├── questionnaires.service.spec.ts     // Unit tests (mocked deps)
    └── questionnaires.e2e.spec.ts         // E2E tests (full stack)

// libs/shared/src/
├── types/
│   └── questionnaire.types.ts      // API response types (shared FE/BE)
└── schemas/
    └── questionnaire.schemas.ts    // Zod schemas (shared validation FE/BE)
```

**BFF Pattern with Shared Types:**
- `libs/shared` contains API contracts (response types) and Zod schemas
- Controllers return types from `@hair-scanner/shared`
- Frontend forms use same Zod schemas for validation
- Domain types in `domain/` are internal to the module

### Layer Implementation

```typescript
// ═══════════════════════════════════════════════════════════
// SHARED TYPES (libs/shared/src/types/questionnaire.types.ts)
// ═══════════════════════════════════════════════════════════
export interface QuestionnaireResponse {
  id: string;
  hairType: HairType;
  concerns: string[];
  goals: string[];
  createdAt: string;
}

export type HairType = 'straight' | 'wavy' | 'curly' | 'coily';

// ═══════════════════════════════════════════════════════════
// SHARED SCHEMAS (libs/shared/src/schemas/questionnaire.schemas.ts)
// ═══════════════════════════════════════════════════════════
import { z } from 'zod';

export const createQuestionnaireSchema = z.object({
  hairType: z.enum(['straight', 'wavy', 'curly', 'coily']),
  concerns: z.array(z.string()).min(1),
  goals: z.array(z.string()).min(1),
});

export type CreateQuestionnaireInput = z.infer<typeof createQuestionnaireSchema>;

// ═══════════════════════════════════════════════════════════
// CONTROLLER (returns shared types)
// ═══════════════════════════════════════════════════════════
import { QuestionnaireResponse, CreateQuestionnaireInput } from '@hair-scanner/shared';

@Controller('questionnaires')
export class QuestionnairesController {
  constructor(private readonly service: QuestionnairesService) {}

  @Post()
  async create(@Body() input: CreateQuestionnaireInput): Promise<QuestionnaireResponse> {
    return this.service.create(input);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<QuestionnaireResponse> {
    return this.service.findById(id);
  }
}

// ═══════════════════════════════════════════════════════════
// SERVICE (business logic)
// ═══════════════════════════════════════════════════════════
@Injectable()
export class QuestionnairesService {
  constructor(private readonly repository: QuestionnairesRepository) {}

  async create(input: CreateQuestionnaireInput): Promise<QuestionnaireResponse> {
    const questionnaire = await this.repository.save(input);
    return this.toResponse(questionnaire);
  }

  async findById(id: string): Promise<QuestionnaireResponse> {
    const questionnaire = await this.repository.findById(id);
    if (!questionnaire) throw new NotFoundException();
    return this.toResponse(questionnaire);
  }

  private toResponse(q: Questionnaire): QuestionnaireResponse {
    return {
      id: q.id,
      hairType: q.hairType,
      concerns: q.concerns,
      goals: q.goals,
      createdAt: q.createdAt.toISOString(),
    };
  }
}

// ═══════════════════════════════════════════════════════════
// REPOSITORY (data access with Drizzle)
// ═══════════════════════════════════════════════════════════
@Injectable()
export class QuestionnairesRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async save(input: CreateQuestionnaireInput): Promise<Questionnaire> {
    const [result] = await this.db
      .insert(questionnaires)
      .values(input)
      .returning();
    return result;
  }

  async findById(id: string): Promise<Questionnaire | null> {
    const [result] = await this.db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.id, id));
    return result ?? null;
  }
}
```

### Interface-Based Design (Same as Go)

```typescript
// Domain interface in domain/questionnaire.ts
export interface IQuestionnairesRepository {
  findById(id: string): Promise<Questionnaire | null>;
  save(input: CreateQuestionnaireInput): Promise<Questionnaire>;
}

// Internal domain type (not exported to shared)
export interface Questionnaire {
  id: string;
  hairType: HairType;
  concerns: string[];
  goals: string[];
  createdAt: Date;  // Date internally, string in API response
}

// Repository implements interface
@Injectable()
export class QuestionnairesRepository implements IQuestionnairesRepository {
  // ... implementation
}

// Service depends on interface
@Injectable()
export class QuestionnairesService {
  constructor(
    @Inject('IQuestionnairesRepository')
    private readonly repository: IQuestionnairesRepository
  ) {}
}
```

---

## 5. Example Application: Hair Product Scanner

### Product Vision

An AI-powered in-store companion that helps users make informed hair product decisions. Users complete a hair profile quiz, then scan product labels in stores (e.g., Hebe, Rossmann) to get AI-powered comparisons based on their preferences.

### Core Features

1. **Hair Profile Quiz** - Users answer questions about their hair type, concerns, and goals
2. **Product Scanner** - Scan product labels in-store using device camera
3. **AI Comparison** - LLM analyzes scanned products against user preferences
4. **Save Favorites** - Users can save products they like for future reference

### User Stories (BDD Format)

```gherkin
Feature: Hair Profile Quiz

  Scenario: New user completes hair profile quiz
    Given I am a new user on the home page
    When I tap "Get Started"
    And I select my hair type as "Curly"
    And I select my concerns as "Frizz" and "Dryness"
    And I select my goals as "Moisturize"
    And I submit the quiz
    Then I should see the scanner screen
    And my profile should be saved

Feature: Product Scanning

  Scenario: User scans a product label
    Given I have completed my hair profile
    And I am on the scanner screen
    When I scan a product label
    Then I should see the product details
    And I should see an AI analysis of how this product matches my hair profile
    And I should see a compatibility score

  Scenario: User compares two products
    Given I have scanned "Product A"
    When I scan "Product B"
    Then I should see a comparison view
    And I should see which product is better for my hair profile
    And I should see specific reasons for the recommendation

Feature: Favorites

  Scenario: Save a product to favorites
    Given I am viewing a product analysis
    When I tap the "Save" button
    Then the product should be added to my favorites
    And I should see a confirmation
```

---

## 6. Seven-Phase Delivery Process

### Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROTOTYPE PHASE (15 min)                      │
│  Phase 0: Lovable.dev Prototype                                 │
│  • Review pre-built prototype with design system                │
│  • Understand component structure                               │
│  • Identify the screen to implement                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PHASES                               │
│  Phase 1: Presentational UI (from Lovable export)               │
│  Phase 2: API Client + Mocks                                    │
│  Phase 3: Smart Components + Integration Tests                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PHASES (Inside-Out TDD)               │
│  Phase 4: Repository + Data Access (Integration Tests First)    │
│  Phase 5: Service Layer + Business Logic (Unit Tests First)     │
│  Phase 6: HTTP Controllers + E2E Tests                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION PHASE                             │
│  Phase 7: Connect Frontend to Backend                           │
│  • Remove mocks, connect real API                               │
│  • Manual testing of complete flow                              │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 0: Lovable.dev Prototype (15 min)

**Purpose:** Review pre-built prototype and understand the design system.

**Activities:**
- Walk through the Lovable prototype
- Identify component hierarchy
- Choose the specific screen to implement in the kata
- Export component names and structure

**Pre-Built Materials:**
- Lovable prototype with design system (colors, typography, spacing)
- Basic responsive layout skeleton
- Component library structure

### Phases 1-7: Implementation

See detailed phase descriptions in the original document. Key changes:

- **Phase 4-6**: Use Drizzle with Testcontainers
- **Phase 6**: Controllers (not Handlers) following NestJS conventions
- **Phase 7**: Local testing only (no deployment)

---

## 7. Testing Philosophy

### The Meaningful Test Manifesto

> **"Stop asking AI to write tests. Start defining test scenarios that matter."**

### Why Inside-Out TDD for AI-Assisted Development?

```
┌─────────────────────────────────────────────────────────────────┐
│  PROBLEM: Outside-In TDD with AI                                │
├─────────────────────────────────────────────────────────────────┤
│  When you write controller tests FIRST:                         │
│                                                                  │
│  1. You write: "POST /api/products should return 201"           │
│  2. AI sees the test needs a controller                         │
│  3. AI implements controller, service, AND repository all at    │
│     once to make the test pass                                  │
│  4. You lose the incremental, testable layers                   │
│  5. Tests become coupled to implementation details              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SOLUTION: Inside-Out TDD with AI                               │
├─────────────────────────────────────────────────────────────────┤
│  When you build from the inside out:                            │
│                                                                  │
│  Phase 4: Repository tests → Repository implementation          │
│           (AI focuses only on data access)                      │
│                                                                  │
│  Phase 5: Service tests → Service implementation                │
│           (AI mocks repository, focuses on business logic)      │
│                                                                  │
│  Phase 6: E2E tests → Controller implementation                 │
│           (All layers exist, AI wires them together)            │
│                                                                  │
│  Result: Clean separation, testable layers, AI stays focused    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight**: AI is eager to make tests pass. If you write an E2E test first, AI will implement everything at once, skipping the careful layer-by-layer construction. Inside-out TDD constrains the AI to build one layer at a time.

### Testing Pyramid (Inverted)

```
        ┌─────────────────────┐
        │   E2E Tests         │  Few, critical user journeys
        │   (Vitest+Supertest)│
        ├─────────────────────┤
        │   Integration Tests │  Most tests here
        │   (Vitest+Testcont) │  Test actual behavior
        ├─────────────────────┤
        │   Unit Tests        │  Pure functions only
        │   (Vitest)          │  Business logic
        └─────────────────────┘
```

### What Makes a Test Meaningful?

| Meaningful | Not Meaningful |
|------------|----------------|
| Tests user can complete quiz | Tests component renders |
| Tests API returns valid products | Tests service method is called |
| Tests scanned label is analyzed | Tests mock was called with args |
| Tests data persists to database | Tests repository method exists |

---

## 8. Workshop Structure (1h 30min)

### Timeline

| Time | Duration | Activity |
|------|----------|----------|
| 0:00 | 10 min | **Introduction**: Workflow overview, stack intro |
| 0:10 | 5 min | **Phase 0**: Review Lovable prototype, identify target screen |
| 0:15 | 10 min | **Demo**: `/story` and `/plan` commands |
| 0:25 | 15 min | **Phases 1-3**: Frontend implementation with `/implement` |
| 0:40 | 25 min | **Phases 4-6**: Backend TDD with testcontainers |
| 1:05 | 10 min | **Phase 7**: Integration + `/commit` |
| 1:15 | 10 min | **Wrap-up**: `/pr`, Q&A, resources |
| 1:25 | 5 min | **Buffer** |

### Command Flow Demonstration

```bash
# 1. Create user story from PRD
/story HAIR-1 "Hair profile quiz"

# 2. Generate implementation plan with BDD scenarios
/plan HAIR-1

# 3. Implement each phase
/implement Phase 1  # Presentational UI
/implement Phase 2  # API Client + Mocks
/implement Phase 3  # Smart Components
/implement Phase 4  # Repository (TDD)
/implement Phase 5  # Service Layer (TDD)
/implement Phase 6  # Controllers (TDD)
/implement Phase 7  # Integration

# 4. Commit with conventional format
/commit

# 5. Create PR
/pr
```

---

## 9. Success Criteria

### For Participants

- [ ] Understand the 7-phase workflow
- [ ] See a complete implementation cycle from prototype to PR
- [ ] Understand why inside-out TDD works better with AI
- [ ] Know how to write meaningful BDD scenarios
- [ ] Have a working starter repo to continue learning

### For Training

- [ ] Complete all 7 phases within time limit
- [ ] Demonstrate AI-assisted TDD effectively
- [ ] Show clear separation between layers
- [ ] Tests pass with real database (testcontainers)

---

## 10. Preparation Checklist

### Starter Repository

- [ ] Nx monorepo initialized
- [ ] Next.js 15 app with Tailwind 4.1
- [ ] NestJS 11 with SWC and Vitest
- [ ] Drizzle ORM configured with PostgreSQL
- [ ] Testcontainers setup for integration tests
- [ ] MSW configured for frontend mocking
- [ ] Shared types library
- [ ] Docker Compose for local PostgreSQL
- [ ] All configs tested and working

### Lovable Prototype

- [ ] Design system (colors, typography, spacing)
- [ ] Responsive layout skeleton
- [ ] Quiz screen mockup
- [ ] Scanner screen mockup
- [ ] Product comparison mockup
- [ ] Component naming conventions documented

### PRD & Documentation

- [ ] Product Requirements Document ready
- [ ] Sample BDD scenarios written
- [ ] Slash commands configured in `.claude/commands/`
- [ ] `AGENTS.md` with project-specific rules

---

## 11. References

- [Kent C. Dodds - Testing JavaScript](https://testingjavascript.com/)
- [App Blueprint - Stop Asking AI to Write Tests](https://appblueprint.substack.com/p/stop-asking-ai-to-write-tests)
- [Lovable.dev Documentation](https://docs.lovable.dev/)
- [NestJS 11 + Vitest](https://docs.nestjs.com/recipes/swc)
- [Next.js + Vitest](https://nextjs.org/docs/app/guides/testing/vitest)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Testcontainers for Node.js](https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/)

---

## Appendix A: Project Structure

```
hair-product-scanner/
├── apps/
│   ├── web/                      # Next.js 16 frontend
│   │   ├── app/                  # App router pages
│   │   │   ├── page.tsx          # Home
│   │   │   ├── quiz/             # Quiz flow
│   │   │   ├── scanner/          # Product scanner
│   │   │   └── favorites/        # Saved scans
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom hooks
│   │   ├── stores/               # Zustand stores
│   │   ├── lib/                  # Utilities
│   │   │   ├── api/              # TanStack Query + API client
│   │   │   └── msw/              # Mock handlers
│   │   └── __tests__/            # Integration tests
│   └── api/                      # NestJS 11 backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── questionnaires/  # Quiz responses (user hair profiles)
│       │   │   │   ├── domain/      # Internal types
│       │   │   │   └── __tests__/   # Tests
│       │   │   ├── scans/           # Product label scans
│       │   │   │   ├── domain/
│       │   │   │   └── __tests__/
│       │   │   ├── favorites/       # Saved scans
│       │   │   │   ├── domain/
│       │   │   │   └── __tests__/
│       │   │   └── ai/              # LLM integration
│       │   ├── database/            # Drizzle config + schema
│       │   │   ├── drizzle.module.ts
│       │   │   ├── schema.ts
│       │   │   └── migrations/      # Generated by drizzle-kit
│       │   └── main.ts
│       └── test/                 # E2E tests
├── libs/
│   └── shared/                   # Shared types & schemas (BFF contract)
│       ├── src/
│       │   ├── types/            # API response types
│       │   │   ├── questionnaire.types.ts
│       │   │   ├── scan.types.ts
│       │   │   └── favorite.types.ts
│       │   └── schemas/          # Zod schemas (form + API validation)
│       │       ├── questionnaire.schemas.ts
│       │       ├── scan.schemas.ts
│       │       └── favorite.schemas.ts
│       └── index.ts
├── drizzle.config.ts             # Drizzle Kit config
├── nx.json
├── package.json
├── docker-compose.yml            # Local PostgreSQL
└── vitest.workspace.ts           # Vitest config
```

## Appendix B: Drizzle Schema & Migrations

### Drizzle Kit Configuration

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './apps/api/src/database/schema.ts',
  out: './apps/api/src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Migration Commands

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Push schema directly (development only)
pnpm drizzle-kit push

# Run migrations programmatically (in app startup)
# See Appendix C for migration runner
```

### Schema Definition

```typescript
// apps/api/src/database/schema.ts
import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Quiz responses - user's hair profile
export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').primaryKey().defaultRandom(),
  hairType: varchar('hair_type', { length: 50 }).notNull(),
  concerns: jsonb('concerns').$type<string[]>().notNull(),
  goals: jsonb('goals').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Product label scans - what user scanned in store
export const scans = pgTable('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionnaireId: uuid('questionnaire_id').references(() => questionnaires.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }),
  ingredients: text('ingredients').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  aiAnalysis: jsonb('ai_analysis').$type<AiAnalysis>(),
  compatibilityScore: varchar('compatibility_score', { length: 10 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Saved scans - user's favorites
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionnaireId: uuid('questionnaire_id').references(() => questionnaires.id).notNull(),
  scanId: uuid('scan_id').references(() => scans.id).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type for AI analysis result
interface AiAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  recommendation: string;
}
```

## Appendix C: Testcontainers Setup

```typescript
// apps/api/test/setup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

let container: StartedPostgreSqlContainer;
let pool: Pool;

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();

  pool = new Pool({
    connectionString: container.getConnectionUri(),
  });

  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: './drizzle' });

  return { db, pool, connectionUri: container.getConnectionUri() };
}

export async function teardownTestDatabase() {
  await pool?.end();
  await container?.stop();
}
```

---

## 12. Next Steps

### Step 1: Create Starter Repository

Initialize the foundation with all tooling configured and tested:

- [ ] Initialize Nx 22 monorepo
- [ ] Add Next.js 16 app with Tailwind 4.1
- [ ] Add NestJS 11 with SWC and Vitest
- [ ] Configure Drizzle ORM with PostgreSQL
- [ ] Set up Testcontainers for integration tests
- [ ] Configure MSW for frontend mocking
- [ ] Create shared types library (`@hair-scanner/shared`)
- [ ] Add Docker Compose for local PostgreSQL
- [ ] Test all configs end-to-end (build, test, lint pass)

### Step 2: Create AI Development Workflow

Build Claude Code workflow with subagents and skills:

**Commands to create** (in `.claude/commands/`):
- [ ] `/prd` - Create Product Requirements Document (high-level features)
- [ ] `/story` - Create User Story with BDD scenarios (Gherkin)
- [ ] `/plan` - Generate 7-phase implementation plan
- [ ] `/implement` - Phase-aware implementation with subagent dispatch
- [ ] `/commit` - Conventional commit with AI attribution
- [ ] `/pr` - Create pull request

**Project rules to create:**
- [ ] Global rules (code generation practices, git commit, no shell scripts)
- [ ] Frontend phase rules (adapted for Next.js 16 + Vitest)
- [ ] Backend phase rules (adapted for NestJS 11 + Drizzle + Testcontainers)
- [ ] Nx rules (workspace-aware commands)

**Workflow documentation:**
- [ ] Write `AGENTS.md` with stack overview and architecture patterns
- [ ] Create `AI-WORKFLOW.md` adapted for Next.js + NestJS stack

### Step 3: Build Lovable Prototype

Create the visual design and component structure:

- [ ] Design system (colors, typography, spacing)
- [ ] Responsive layout skeleton
- [ ] Quiz screen mockup
- [ ] Scanner screen mockup (simplified for kata)
- [ ] Product comparison mockup
- [ ] Document component naming conventions

### Step 4: Write PRD

High-level product definition (NOT BDD scenarios - those come at story level):

- [ ] Product vision and scope
- [ ] Target users and use cases
- [ ] Feature list for MVP
- [ ] Out of scope / future features
- [ ] Technical constraints

### Step 5: Decide Kata Scope

- [ ] **Recommended: Quiz flow** - simpler than scanner, demonstrates full 7-phase cycle
- [ ] Scanner can be shown as "what's next" or stretch goal
- [ ] Prepare the specific feature to implement during kata

### Kata Day Workflow

During the kata, participants will USE the pre-configured commands:

```bash
# 1. Review Lovable prototype (5 min)
#    → Identify components, understand design

# 2. Create story from prototype
/story HAIR-1 "Complete hair profile quiz"
#    → AI generates BDD scenarios from prototype

# 3. Generate implementation plan
/plan HAIR-1
#    → 7-phase plan with specific tasks

# 4. Implement all phases
/implement Phase 1   # Presentational UI
/implement Phase 2   # API Client + Mocks
/implement Phase 3   # Smart Components
/implement Phase 4   # Repository (TDD)
/implement Phase 5   # Service Layer (TDD)
/implement Phase 6   # Controllers (TDD)
/implement Phase 7   # Integration

# 5. Commit and PR
/commit
/pr
```

### Post-Kata

- [ ] Publish starter repo on GitHub
- [ ] Share Lovable prototype link
- [ ] Recording/slides (if applicable)
- [ ] Follow-up learning resources
