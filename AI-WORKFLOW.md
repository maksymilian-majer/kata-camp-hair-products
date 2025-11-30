# AI-Assisted Development Workflow

This document describes the 7-phase delivery workflow for AI-assisted development using Claude Code.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLANNING PHASE                                │
│  /prd → /story → /plan                                          │
│  Create PRD → Define user story with BDD → Generate 7-phase plan │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PHASES                               │
│  /implement Phase 1  →  Presentational UI (pure components)      │
│  /implement Phase 2  →  API Client + Mocks (TanStack Query, MSW) │
│  /implement Phase 3  →  Smart Components (connect UI to state)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PHASES (Inside-Out TDD)               │
│  /implement Phase 4  →  Repository Layer (Testcontainers)        │
│  /implement Phase 5  →  Service Layer (mocked repositories)      │
│  /implement Phase 6  →  Controllers (Supertest E2E)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION PHASE                             │
│  /implement Phase 7  →  Connect frontend to real backend API     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY                                      │
│  /commit → /pr                                                   │
│  Conventional commit → Pull request                              │
└─────────────────────────────────────────────────────────────────┘
```

## Command Flow

### Solo Developer Workflow (One Commit Per Phase)

```bash
# 1. Planning
/prd HairScanner "AI-powered hair product ingredient scanner"
/story HAIR-1 "Complete hair profile quiz"
/plan HAIR-1

# 2. Frontend Implementation
/implement Phase 1    # Presentational UI
/commit               # feat(web): add quiz UI components

/implement Phase 2    # API Client + Mocks
/commit               # feat(web): add quiz API client with MSW mocks

/implement Phase 3    # Smart Components
/commit               # feat(web): connect quiz UI to state management

# 3. Backend Implementation (TDD)
/implement Phase 4    # Repository Layer
/commit               # feat(api): add questionnaire repository with tests

/implement Phase 5    # Service Layer
/commit               # feat(api): add questionnaire service with tests

/implement Phase 6    # Controllers
/commit               # feat(api): add questionnaire endpoints with E2E tests

# 4. Integration
/implement Phase 7    # Connect Frontend to Backend
/commit               # feat: integrate quiz flow with real API

# 5. Create PR
/pr
```

## Phase Details

### Phase 1: Presentational UI

**Subagent:** `frontend-phase-1`
**Skills:** `nextjs-patterns`, `vitest-testing`

**Responsibilities:**

- Build pure UI components with no business logic
- Use TypeScript props interfaces
- Style with Tailwind CSS
- Components should be < 80 lines
- Write tests AFTER implementation

**Output:**

- `apps/web/src/components/` - Presentational components
- `apps/web/src/components/__tests__/` - Component tests

---

### Phase 2: API Client + Mocks

**Subagent:** `frontend-phase-2`
**Skills:** `nextjs-patterns`, `bff-patterns`

**Responsibilities:**

- Create TanStack Query hooks for data fetching
- Set up MSW handlers for mocking API responses
- Define API response types in shared library
- No real API calls yet

**Output:**

- `apps/web/src/lib/api/` - TanStack Query hooks
- `apps/web/src/mocks/` - MSW mock handlers
- `libs/shared/src/types/` - API response types

---

### Phase 3: Smart Components

**Subagent:** `frontend-phase-3`
**Skills:** `nextjs-patterns`, `vitest-testing`

**Responsibilities:**

- Connect presentational components to state
- Implement Zustand stores for client state
- Wire up TanStack Query hooks
- Handle loading, error, and success states
- Write integration tests for user flows

**Output:**

- `apps/web/src/stores/` - Zustand stores
- `apps/web/src/app/` - Page components with smart logic
- Integration tests for complete flows

---

### Phase 4: Repository Layer (TDD)

**Subagent:** `backend-phase-4`
**Skills:** `drizzle-repository`, `testcontainers`, `vitest-testing`

**Responsibilities:**

- Write repository tests FIRST (test-driven)
- Implement Drizzle-based repositories
- Use Testcontainers for real PostgreSQL in tests
- Define database schema if needed

**Testing Approach:**

```
1. Write failing test → 2. Implement repository → 3. Test passes
```

**Output:**

- `apps/api/src/modules/*/domain/` - Repository interfaces
- `apps/api/src/modules/*/*.repository.ts` - Repository implementations
- `apps/api/src/modules/*/__tests__/*.repository.spec.ts` - Integration tests

---

### Phase 5: Service Layer (TDD)

**Subagent:** `backend-phase-5`
**Skills:** `nestjs-architecture`, `vitest-testing`

**Responsibilities:**

- Write service tests FIRST with mocked repositories
- Implement business logic in services
- Transform domain types to API response types
- Handle validation and error cases

**Testing Approach:**

```
1. Write failing test (mock repo) → 2. Implement service → 3. Test passes
```

**Output:**

- `apps/api/src/modules/*/*.service.ts` - Service implementations
- `apps/api/src/modules/*/__tests__/*.service.spec.ts` - Unit tests

---

### Phase 6: HTTP Controllers (TDD)

**Subagent:** `backend-phase-6`
**Skills:** `nestjs-architecture`, `vitest-testing`, `bff-patterns`

**Responsibilities:**

- Write E2E tests FIRST with Supertest
- Implement thin controllers (validation + delegation)
- Return types from `@hair-product-scanner/shared`
- Wire up NestJS modules

**Testing Approach:**

```
1. Write failing E2E test → 2. Implement controller → 3. Test passes
```

**Output:**

- `apps/api/src/modules/*/*.controller.ts` - Controller implementations
- `apps/api/src/modules/*/*.module.ts` - NestJS modules
- `apps/api/src/modules/*/__tests__/*.e2e.spec.ts` - E2E tests

---

### Phase 7: Frontend-Backend Integration

**Subagent:** `integration-phase-7`
**Skills:** `nextjs-patterns`, `bff-patterns`

**Responsibilities:**

- Remove MSW mocks (or make them optional)
- Configure real API endpoints
- Test complete user flows manually
- Fix any integration issues

**Output:**

- Updated API client configuration
- Environment variables for API URL
- Working end-to-end application

---

## Testing Philosophy

### Why Inside-Out TDD for Backend?

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
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  SOLUTION: Inside-Out TDD with AI                               │
├─────────────────────────────────────────────────────────────────┤
│  Phase 4: Repository tests → Repository implementation          │
│           (AI focuses only on data access)                      │
│                                                                  │
│  Phase 5: Service tests → Service implementation                │
│           (AI mocks repository, focuses on business logic)      │
│                                                                  │
│  Phase 6: E2E tests → Controller implementation                 │
│           (All layers exist, AI wires them together)            │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Testing Strategy

- **Phase 1**: Test presentational components after implementation
- **Phase 2**: Test API hooks with mocked responses
- **Phase 3**: Integration tests for user flows

### Backend Testing Strategy

- **Phase 4**: Integration tests with real PostgreSQL (Testcontainers)
- **Phase 5**: Unit tests with mocked repositories
- **Phase 6**: E2E tests with full application stack

---

## Subagent Architecture

```
.claude/
├── commands/                    # Slash commands (user-invoked)
│   ├── prd.md                  # /prd - Product Requirements Document
│   ├── story.md                # /story - User story with BDD
│   ├── plan.md                 # /plan - 7-phase implementation plan
│   ├── implement.md            # /implement - Phase dispatcher
│   ├── commit.md               # /commit - Conventional commit
│   └── pr.md                   # /pr - Pull request
│
├── agents/                      # Phase subagents
│   ├── frontend-phase-1.md     # Presentational UI
│   ├── frontend-phase-2.md     # API Client + Mocks
│   ├── frontend-phase-3.md     # Smart Components
│   ├── backend-phase-4.md      # Repository (TDD)
│   ├── backend-phase-5.md      # Service Layer (TDD)
│   ├── backend-phase-6.md      # Controllers (TDD)
│   └── integration-phase-7.md  # Integration
│
└── skills/                      # Reusable knowledge
    ├── nextjs-patterns/        # Next.js App Router patterns
    ├── nestjs-architecture/    # NestJS Clean Architecture
    ├── drizzle-repository/     # Drizzle ORM patterns
    ├── vitest-testing/         # Vitest testing patterns
    ├── testcontainers/         # Testcontainers setup
    └── bff-patterns/           # BFF response contracts
```

---

## Quick Reference

| Command                     | Purpose                                 | Output                    |
| --------------------------- | --------------------------------------- | ------------------------- |
| `/prd [name] [description]` | Create Product Requirements Document    | `docs/PRD-{name}.md`      |
| `/story [ID] [description]` | Create user story with BDD scenarios    | `docs/stories/{ID}.md`    |
| `/plan [ID]`                | Generate 7-phase implementation plan    | `docs/plans/PLAN-{ID}.md` |
| `/implement Phase N`        | Execute phase with specialized subagent | Code + tests              |
| `/commit`                   | Create conventional commit              | Git commit                |
| `/pr`                       | Create pull request                     | GitHub PR                 |

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Project guidelines and conventions
- [TRAINING-REQUIREMENTS.md](./docs/TRAINING-REQUIREMENTS.md) - Full training context
- [001-KATA-CAMP-PLAN.md](./docs/001-KATA-CAMP-PLAN.md) - Implementation plan
