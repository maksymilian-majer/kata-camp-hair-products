---
description: Create a 7-phase implementation plan from a user story
argument-hint: [STORY-ID]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Create Implementation Plan

Create a detailed 7-phase implementation plan for $ARGUMENTS following the BFF (Backend-for-Frontend) delivery pattern.

## What This Command Creates

Creates a comprehensive implementation plan with:

- 7 phases following the BFF pattern (Frontend first, then Backend, then Integration)
- Phase-specific tasks with checkboxes for progress tracking
- Testing strategy for each phase (test-after for FE, test-first for BE)
- Meaningful test scenarios derived from BDD acceptance criteria
- Subagent mapping for `/implement` command

## The 7-Phase Delivery Process

This plan follows an intentional sequence that enables parallel development and reduces integration risk:

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PHASES                               │
│  Phase 1: Presentational UI (from Lovable export)               │
│  Phase 2: API Client + Mocks (MSW)                              │
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

## Why Inside-Out TDD for Backend?

When working with AI-assisted development, **inside-out TDD** works better than outside-in:

| Outside-In Problem                                     | Inside-Out Solution               |
| ------------------------------------------------------ | --------------------------------- |
| AI implements everything at once to make E2E test pass | AI builds one layer at a time     |
| Tests become coupled to implementation details         | Each layer is tested in isolation |
| Harder to identify where bugs originate                | Clear layer boundaries            |

**Inside-Out sequence:**

1. **Phase 4**: Repository tests → Repository implementation (tests against real DB with Testcontainers)
2. **Phase 5**: Service tests → Service implementation (mocked repository)
3. **Phase 6**: E2E tests → Controller implementation (full stack)

## Process

### 1. Get Current Date

Retrieves current date for plan naming using a shell command.

### 2. Locate User Story

Search for the story file in `docs/stories/`:

- Read story file: `docs/stories/{STORY-ID}-*.md`
- Extract BDD acceptance criteria (Gherkin scenarios)
- Understand feature scope and requirements

### 3. Ask Clarifying Questions (If Needed)

**IMPORTANT**: Only ask questions about genuinely unclear aspects. Do NOT ask about:

- Information already in the story or PRD
- Established patterns from CLAUDE.md
- Information from recent conversation context

### 4. Generate 7-Phase Plan

Create plan file with:

- Phase breakdown with specific tasks
- Testing strategy per phase
- Meaningful test scenarios from BDD criteria
- Checkboxes for progress tracking
- Subagent mapping

## Plan Structure

### File Location

- **Directory**: `docs/plans/`
- **File**: `PLAN-{STORY-ID}-{kebab-case-title}.md`
- **Example**: `docs/plans/PLAN-HAIR-1-app-layout-navigation.md`

The title should be a short (2-5 words) kebab-case description derived from the story or feature name.

### Template Structure

````markdown
# Implementation Plan: [Feature Title]

**Story**: [STORY-ID]
**Created**: [Date]

## Overview

Brief description of what will be implemented based on the user story.

## BDD Scenarios to Implement

List the Gherkin scenarios from the story that this plan will implement:

```gherkin
Scenario: [Name]
Given [context]
When [action]
Then [outcome]
```

---

## Phase 1: Presentational UI Components

**Subagent**: `frontend-phase-1`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Create [ComponentName] component
- [ ] Create [ComponentName] component
- [ ] Style components with Tailwind
- [ ] Add TypeScript props interfaces

### Test Scenarios

After implementation, write tests that verify:

- [ ] Components render with required props
- [ ] Components display correct content based on props
- [ ] Components handle empty/edge case props gracefully

### Completion Criteria

- [ ] All components created and styled
- [ ] Props interfaces defined
- [ ] Components viewable at temporary route `/dev/[feature]`
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 2: API Client + Mocks

**Subagent**: `frontend-phase-2`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Define API types in `@hair-product-scanner/shared`
- [ ] Create TanStack Query hooks
- [ ] Set up MSW handlers with mock responses
- [ ] Create Zod schemas for validation

### Test Scenarios

After implementation, write tests that verify:

- [ ] Query hooks return expected mock data
- [ ] Error states are handled correctly
- [ ] Loading states work as expected

### Completion Criteria

- [ ] Types defined in shared library
- [ ] Query hooks created
- [ ] MSW mocks return realistic data
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 3: Smart Components + State

**Subagent**: `frontend-phase-3`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Connect presentational components to query hooks
- [ ] Add Zustand store for client state (if needed)
- [ ] Implement form handling with React Hook Form + Zod
- [ ] Add routing/navigation
- [ ] Wire up user interactions

### Test Scenarios

After implementation, write integration tests that verify:

- [ ] User can complete the flow end-to-end (with mocks)
- [ ] Form validation works correctly
- [ ] Error states display appropriate messages
- [ ] Loading states appear during async operations

### Completion Criteria

- [ ] Feature works end-to-end with mocked API
- [ ] Form validation functional
- [ ] Navigation works correctly
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 4: Repository Layer (TDD)

**Subagent**: `backend-phase-4`
**Testing**: Write tests FIRST (Testcontainers)

### Tasks

- [ ] Write repository integration tests FIRST
- [ ] Define repository interface
- [ ] Implement repository with Drizzle
- [ ] Add database migrations (if needed)

### Test Scenarios (Write BEFORE Implementation)

Write integration tests using Testcontainers that verify:

```typescript
// Example test structure
describe('QuestionnairesRepository', () => {
  it('should save a questionnaire and return it with generated ID', async () => {
    // Given: valid questionnaire input
    // When: repository.save(input)
    // Then: returns questionnaire with UUID
  });

  it('should find questionnaire by ID', async () => {
    // Given: existing questionnaire in database
    // When: repository.findById(id)
    // Then: returns the questionnaire
  });

  it('should return null for non-existent ID', async () => {
    // Given: ID that doesn't exist
    // When: repository.findById(nonExistentId)
    // Then: returns null
  });
});
```

### Completion Criteria

- [ ] Repository tests written and initially failing
- [ ] Repository implementation complete
- [ ] All tests pass: `pnpm nx test api`

---

## Phase 5: Service Layer (TDD)

**Subagent**: `backend-phase-5`
**Testing**: Write tests FIRST (Unit tests with mocked repository)

### Tasks

- [ ] Write service unit tests FIRST
- [ ] Define service interface
- [ ] Implement service with business logic
- [ ] Add DTO transformations (domain → response)

### Test Scenarios (Write BEFORE Implementation)

Write unit tests with mocked repository:

```typescript
// Example test structure
describe('QuestionnairesService', () => {
  it('should create questionnaire and return response DTO', async () => {
    // Given: valid input, mocked repository
    // When: service.create(input)
    // Then: returns QuestionnaireResponse with ISO date string
  });

  it('should throw NotFoundException for non-existent questionnaire', async () => {
    // Given: repository returns null
    // When: service.findById(nonExistentId)
    // Then: throws NotFoundException
  });
});
```

### Completion Criteria

- [ ] Service tests written and initially failing
- [ ] Service implementation complete
- [ ] All tests pass: `pnpm nx test api`

---

## Phase 6: HTTP Controllers (TDD)

**Subagent**: `backend-phase-6`
**Testing**: Write E2E tests FIRST (Supertest + Testcontainers)

### Tasks

- [ ] Write E2E tests FIRST
- [ ] Create NestJS controller
- [ ] Add validation pipes
- [ ] Wire up module dependencies

### Test Scenarios (Write BEFORE Implementation)

Write E2E tests with Supertest:

```typescript
// Example test structure
describe('POST /api/questionnaires', () => {
  it('should create questionnaire and return 201', async () => {
    // Given: valid request body
    // When: POST /api/questionnaires
    // Then: 201 status, response matches QuestionnaireResponse
  });

  it('should return 400 for invalid input', async () => {
    // Given: invalid request body (missing required fields)
    // When: POST /api/questionnaires
    // Then: 400 status with validation errors
  });
});

describe('GET /api/questionnaires/:id', () => {
  it('should return questionnaire by ID', async () => {
    // Given: existing questionnaire
    // When: GET /api/questionnaires/:id
    // Then: 200 status, response matches questionnaire
  });

  it('should return 404 for non-existent ID', async () => {
    // Given: non-existent ID
    // When: GET /api/questionnaires/:id
    // Then: 404 status
  });
});
```

### Completion Criteria

- [ ] E2E tests written and initially failing
- [ ] Controller implementation complete
- [ ] All tests pass: `pnpm nx test api`
- [ ] Manual verification with cURL/Postman

---

## Phase 7: Frontend-Backend Integration

**Subagent**: `integration-phase-7`
**Testing**: Manual testing of complete flow

### Tasks

- [ ] Remove MSW mocks (or configure for development only)
- [ ] Update API client to use real endpoints
- [ ] Test complete user flow
- [ ] Fix any integration issues

### Verification Checklist

Manually verify each BDD scenario:

- [ ] **Scenario 1**: [Copy from BDD scenarios above]
- [ ] **Scenario 2**: [Copy from BDD scenarios above]
- [ ] **Scenario 3**: [Copy from BDD scenarios above]

### Completion Criteria

- [ ] Frontend connected to real backend
- [ ] All BDD scenarios verified manually
- [ ] No console errors
- [ ] Ready for PR

---

## Meaningful Test Manifesto

> **"Stop asking AI to write tests. Start defining test scenarios that matter."**

### What Makes a Test Meaningful?

| Meaningful                       | Not Meaningful                  |
| -------------------------------- | ------------------------------- |
| Tests user can complete quiz     | Tests component renders         |
| Tests API returns valid products | Tests service method is called  |
| Tests scanned label is analyzed  | Tests mock was called with args |
| Tests data persists to database  | Tests repository method exists  |

### Testing Pyramid (Inverted for Clarity)

```
        ┌─────────────────────┐
        │   E2E Tests         │  Few, critical user journeys
        │   (Supertest)       │
        ├─────────────────────┤
        │   Integration Tests │  Most tests here
        │   (Testcontainers)  │  Test actual behavior
        ├─────────────────────┤
        │   Unit Tests        │  Pure functions only
        │   (Vitest)          │  Business logic
        └─────────────────────┘
```
````

## Phase-to-Subagent Mapping

When generating the plan, ensure each phase references the correct subagent:

| Phase | Subagent              | Stack                         | Testing Approach |
| ----- | --------------------- | ----------------------------- | ---------------- |
| 1     | `frontend-phase-1`    | Next.js, Tailwind             | Tests after      |
| 2     | `frontend-phase-2`    | TanStack Query, MSW, Zod      | Tests after      |
| 3     | `frontend-phase-3`    | Zustand, React Hook Form      | Tests after      |
| 4     | `backend-phase-4`     | Drizzle, Testcontainers       | Tests first      |
| 5     | `backend-phase-5`     | NestJS Services               | Tests first      |
| 6     | `backend-phase-6`     | NestJS Controllers, Supertest | Tests first      |
| 7     | `integration-phase-7` | Full stack                    | Manual testing   |

## Adapting the Plan

Not every feature requires all 7 phases. Adapt the plan based on the feature's needs:

### Phase 0: Infrastructure (Optional)

Add Phase 0 when the feature requires infrastructure setup before implementation:

- Docker configuration
- CI/CD pipeline changes
- Environment configuration
- Database setup
- Third-party service integration

### Skipping Phases

Skip phases that don't apply to the feature:

- **Skip Phase 4 (Repository)**: When the feature doesn't need a repository layer (e.g., simple controller with direct DB query, external API calls only)
- **Skip Phase 5 (Service)**: When there's no business logic beyond data access (e.g., health check, simple CRUD without validation)
- **Skip Phases 4-6**: For frontend-only features (e.g., UI components, client-side state)
- **Skip Phases 1-3**: For backend-only features (e.g., background jobs, API-only endpoints)

When skipping phases, clearly note which phases are skipped and why in the plan.

## After Plan Creation

- Plan is created but implementation doesn't start automatically
- Use `/implement Phase N` to implement each phase
- Each phase should result in a commit via `/commit`
- After Phase 7, use `/pr` to create a pull request

## Usage Examples

```
/plan HAIR-1

Create an implementation plan for the Hair Profile Quiz story (HAIR-1).

[Attached: Screenshot of Lovable prototype for reference]
```

```
/plan HAIR-2

Create an implementation plan for the Product Scanner story.
Note: This feature requires camera access and OCR integration.
```
