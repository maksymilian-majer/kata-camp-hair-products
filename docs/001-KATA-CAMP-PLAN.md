# Plan: Kata Camp Starter Repository Setup

## Overview

This plan covers two deliverables:

1. **Repository Setup** - Nx 22 monorepo with Next.js 16, NestJS 11, Drizzle, Vitest, Testcontainers
2. **AI Workflow Setup** - Claude Code native workflow using subagents and skills instead of Cursor rules

---

## Part 1: Repository Setup Plan

### Step 1.1: Create Nx 22 Monorepo ✅

```bash
# Create empty Nx workspace with pnpm
npx create-nx-workspace@latest hair-product-scanner --preset=apps --pm=pnpm

cd hair-product-scanner
```

### Step 1.1b: Add Planning Documents ✅

Create documentation files:

- `docs/TRAINING-REQUIREMENTS.md` - Training session requirements and stack decisions
- `docs/001-KATA-CAMP-PLAN.md` - This implementation plan

### Step 1.2: Add Nx Plugins

```bash
# Add required plugins
pnpm nx add @nx/next
pnpm nx add @nx/nest
pnpm nx add @nx/vite
```

### Step 1.3: Generate Next.js 16 App

```bash
pnpm nx g @nx/next:app web \
  --directory=apps/web \
  --appDir=true \
  --e2eTestRunner=none \
  --style=tailwindcss
```

**Manual configuration after generation:**

- Update to Tailwind 4.1 in `apps/web/tailwind.config.js`
- Configure Vitest (replace Jest)

### Step 1.4: Generate NestJS 11 App with SWC

```bash
pnpm nx g @nx/nest:app api \
  --directory=apps/api
```

**Manual configuration after generation:**

- Enable SWC in `apps/api/project.json`
- Configure Vitest (replace Jest)

### Step 1.5: Generate Shared Library

```bash
pnpm nx g @nx/js:lib shared \
  --directory=libs/shared \
  --bundler=none \
  --unitTestRunner=vitest
```

**Structure for shared lib:**

```
libs/shared/src/
├── types/
│   ├── questionnaire.types.ts
│   ├── scan.types.ts
│   └── index.ts
├── schemas/
│   ├── questionnaire.schemas.ts
│   ├── scan.schemas.ts
│   └── index.ts
└── index.ts
```

### Step 1.6: Install Dependencies

```bash
# Drizzle ORM
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg

# Zod for validation
pnpm add zod

# Vitest and testing
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom

# Testcontainers for backend
pnpm add -D @testcontainers/postgresql testcontainers

# TanStack Query
pnpm add @tanstack/react-query

# Zustand
pnpm add zustand

# MSW for frontend mocking
pnpm add -D msw

# OpenAI SDK
pnpm add openai

# Supertest for E2E
pnpm add -D supertest @types/supertest

# Pre-commit hooks
pnpm add -D husky lint-staged
```

### Step 1.7: Configure Vitest

**Root `vitest.workspace.ts`:**

```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['apps/web/vitest.config.ts', 'apps/api/vitest.config.ts', 'libs/shared/vitest.config.ts']);
```

**Frontend Vitest (`apps/web/vitest.config.ts`):**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [react(), nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

**Backend Vitest (`apps/api/vitest.config.ts`):**

```typescript
import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000, // For testcontainers
  },
});
```

### Step 1.8: Configure Drizzle

**`drizzle.config.ts` (root):**

```typescript
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

**`apps/api/src/database/schema.ts`:**

- questionnaires table
- scans table
- favorites table

### Step 1.9: Docker Compose for Local PostgreSQL

**`docker-compose.yml`:**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: hair_scanner
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 1.10: Package.json Scripts

```json
{
  "scripts": {
    "prepare": "husky",
    "dev": "nx run-many --target=serve --projects=web,api",
    "dev:web": "nx serve web",
    "dev:api": "nx serve api",
    "build": "nx run-many --target=build",
    "test": "nx run-many --target=test",
    "test:web": "nx test web",
    "test:api": "nx test api",
    "lint": "nx run-many --target=lint",
    "typecheck": "nx run-many --target=typecheck",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Step 1.11: Configure Pre-commit Hooks (Husky + lint-staged)

Install husky and lint-staged at the root (monorepo best practice):

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

**Create `.husky/pre-commit`:**

```bash
npx lint-staged --concurrent false --relative
```

**Key flags:**

- `--concurrent false`: Prevents formatting/linting from conflicting with type-checking
- `--relative`: Ensures file paths are relative to repo root (required for Nx)

**Create `lint-staged.config.js` (root):**

```javascript
module.exports = {
  // Type-check affected TypeScript files
  '{apps,libs}/**/*.{ts,tsx}': (files) => {
    return `nx affected --target=typecheck --files=${files.join(',')}`;
  },
  // Lint and format affected files
  '{apps,libs}/**/*.{js,ts,jsx,tsx,json}': (files) => [`nx affected:lint --files=${files.join(',')}`, `nx format:write --files=${files.join(',')}`],
};
```

**How it works:**

1. `lint-staged` collects staged files and passes them to Nx commands
2. `nx affected` uses the `--files` flag to override default behavior
3. Only modified files and their dependents are checked (not entire workspace)

**References:**

- [This Dot Labs - Nx + Husky + lint-staged Guide](https://www.thisdot.co/blog/linting-formatting-and-type-checking-commits-in-an-nx-monorepo-with-husky)
- [Christian Lüdemann - Git Hooks in Nx](https://christianlydemann.com/how-to-set-up-git-hooks-in-an-nx-repo/)

---

## Part 2: AI Workflow Setup Plan

### Design Decisions

**7 Separate Subagents vs 1 Dispatcher** (Recommendation: 7 Separate)

- Better context isolation - each phase has focused system prompt
- Cleaner skill loading - each subagent declares only relevant skills
- Model flexibility - can use Haiku for simple phases, Sonnet for complex
- Easier maintenance - update one phase without affecting others

**Simplified Commands** (No Jira, No Domain Grounding)

- All documentation in code repository (docs/)
- No external issue tracker integration
- Simpler command logic

### Architecture Overview

```
.claude/
├── commands/                    # Slash commands (user-invoked)
│   ├── prd.md                  # /prd - Create Product Requirements Document
│   ├── story.md                # /story - Create user story
│   ├── plan.md                 # /plan - Create implementation plan
│   ├── implement.md            # /implement - Dispatch to phase subagent
│   ├── commit.md               # /commit - Conventional commit
│   └── pr.md                   # /pr - Create pull request
│
├── agents/                      # Subagents (7 separate for isolation)
│   ├── frontend-phase-1.md     # Presentational UI implementation
│   ├── frontend-phase-2.md     # API Client + Mocks implementation
│   ├── frontend-phase-3.md     # Smart Components implementation
│   ├── backend-phase-4.md      # Repository (TDD) implementation
│   ├── backend-phase-5.md      # Service Layer (TDD) implementation
│   ├── backend-phase-6.md      # HTTP Controllers (TDD) implementation
│   └── integration-phase-7.md  # Frontend-Backend connection
│
└── skills/                      # Skills (all inline in SKILL.md)
    ├── nextjs-patterns/        # Next.js 16 App Router patterns
    │   └── SKILL.md
    ├── nestjs-architecture/    # NestJS Clean Architecture patterns
    │   └── SKILL.md
    ├── drizzle-repository/     # Drizzle ORM repository patterns
    │   └── SKILL.md
    ├── vitest-testing/         # Vitest testing patterns
    │   └── SKILL.md
    ├── testcontainers/         # Testcontainers integration testing
    │   └── SKILL.md
    └── bff-patterns/           # BFF response shapes and contracts
        └── SKILL.md

CLAUDE.md                        # Global rules (project root, extends Nx section)
AI-WORKFLOW.md                   # Workflow documentation
```

### Step 2.1: Update CLAUDE.md (Global Rules)

Location: Project root `CLAUDE.md` (already exists with Nx guidelines)

**Keep existing Nx section**, then add project-specific content:

- Project overview and stack summary
- Architecture philosophy (anemic domain, not DDD)
- Layer flow (Controller → Service → Repository)
- Shared library usage (`@hair-scanner/shared`)
- Code generation practices (no comments unless requested)
- Git commit conventions
- Testing philosophy (inside-out TDD for backend)

### Step 2.2: Create AI-WORKFLOW.md

Location: Project root `AI-WORKFLOW.md`

Content:

- Solo workflow diagram (commit per phase)
- Command flow: `/story` → `/plan` → `/implement Phase N` → `/commit` → `/pr`
- Phase overview with subagent mapping
- Testing requirements per phase (TDD for backend)

### Step 2.3: Create Slash Commands

#### `/prd` Command (`.claude/commands/prd.md`)

```yaml
---
description: Create Product Requirements Document for the entire product
argument-hint: [ PRODUCT-NAME ] [ Description ]
allowed-tools: Read, Write, Edit, Glob, Grep
---
```

**PRD Template Sections** (simplified, product-level):

1. **Introduction & Overview** - What the product is, problem it solves
2. **Goals** - User goals + business goals (no metrics)
3. **Target Audience** - Primary and secondary users
4. **Core Features** - Organized by user view/role
5. **Technical Requirements** - Stack, integrations
6. **Constraints** - Timeline, scope limitations
7. **Future Considerations** - Post-MVP ideas

**What NOT to include** (simplified for training):

- Goals & Success Criteria section
- Tracking Plan (events, analytics SQL)
- Rollout Plan (feature flags, treatments)
- API specifications
- Database schema details

**Output location**: `docs/PRD-{product-name}.md`

#### `/story` Command (`.claude/commands/story.md`)

```yaml
---
description: Create user story with BDD scenarios
argument-hint: [ STORY-ID ] [ Description ]
allowed-tools: Read, Write, Edit, Glob, Grep
---
```

**Simplified** (no Jira, no grounding):

- Read PRD if exists for context
- Create story file in `docs/stories/`
- Generate Gherkin scenarios (BDD)
- Include user persona, feature statement, acceptance criteria

**Output location**: `docs/stories/{STORY-ID}-{description}.md`

#### `/plan` Command (`.claude/commands/plan.md`)

```yaml
---
description: Create 7-phase implementation plan
argument-hint: [STORY-ID or DESCRIPTION]
allowed-tools: Read, Write, Edit, Glob, Grep
---
```

**Simplified** (no Jira, no grounding):

- Read story file for BDD scenarios
- Create 7-phase implementation plan
- Map phases to subagents
- Include phase checkboxes for tracking

**Output location**: `docs/plans/PLAN-{STORY-ID}.md`

#### `/implement` Command (`.claude/commands/implement.md`)

```yaml
---
description: Implement a phase using specialized subagent
argument-hint: Phase [1-7]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, TodoWrite
---
```

Responsibilities:

- Parse phase number from input
- Invoke appropriate phase subagent
- Update plan with completion status

### Step 2.4: Create Phase Subagents

Each subagent in `.claude/agents/` has:

```yaml
---
name: frontend-phase-1
description: |
  Implement Phase 1 (Presentational UI). Use PROACTIVELY when /implement Phase 1 is called.
  Creates pure UI components with TypeScript props and Tailwind styling.
tools: Read, Write, Edit, Glob, Grep, Bash
model: sonnet
skills: nextjs-patterns, vitest-testing
---

# Phase 1: Presentational UI Components

  You are implementing Phase 1 of the 7-phase delivery process.

## Your Responsibilities
- Build pure UI components with no business logic
- Use TypeScript props interfaces
- Style with Tailwind 4.1
- Write tests AFTER implementation (not TDD)

## Success Criteria
- All components < 80 lines
- Components are pure (no hooks, no state)
- Tests pass

## References
- Read CLAUDE.md for global patterns
- Use nextjs-patterns skill for App Router patterns
- Use vitest-testing skill for test patterns
```

**Backend Subagents (Phases 4-6)** include:

- Test-first requirement emphasized
- Reference to testcontainers skill
- Reference to drizzle-repository skill

### Step 2.5: Create Skills

Each skill in `.claude/skills/` has a `SKILL.md`:

#### `nextjs-patterns/SKILL.md`

```yaml
---
name: nextjs-patterns
description: Next.js 16 App Router patterns. Use when building React components, pages, or layouts in the web app.
allowed-tools: Read, Glob
---
# Next.js 16 Patterns for Hair Product Scanner

## App Router Structure
- app/ directory for pages
- Nested layouts
- Server vs Client components

## Component Patterns
- Use 'use client' only when needed
- Prefer server components for data fetching
- Use Suspense for loading states

## Forms
- React Hook Form with Zod validation
- Use shared schemas from @hair-scanner/shared
```

#### `drizzle-repository/SKILL.md`

```yaml
---
name: drizzle-repository
description: Drizzle ORM repository patterns. Use when implementing data access in Phase 4.
allowed-tools: Read, Glob
---

# Drizzle Repository Patterns

## Repository Structure
- Interface in domain/
- Implementation uses Drizzle query builder
- Explicit SQL-like queries (no ORM magic)

## Example Pattern
  [ Include questionnaire repository example from TRAINING-REQUIREMENTS.md ]

## Testing with Testcontainers
  [ Include testcontainers setup pattern ]
```

#### `testcontainers/SKILL.md`

```yaml
---
name: testcontainers
description: Testcontainers integration testing patterns. Use for backend integration tests in Phases 4-6.
allowed-tools: Read, Glob
---

# Testcontainers for Backend Testing

  ## Setup
  [ Include PostgreSQL container setup ]

  ## Repository Tests
  [ Include repository test pattern ]

  ## E2E Tests
  [ Include E2E test pattern with Supertest ]
```

### Step 2.6: Wire Commands to Subagents

The `/implement` command dispatcher:

```markdown
# /implement Command

When user runs `/implement Phase N`:

1. Identify phase number (1-7)
2. Read the plan file to get phase tasks
3. Invoke the appropriate subagent:

- Phase 1 → Use frontend-phase-1 subagent
- Phase 2 → Use frontend-phase-2 subagent
- Phase 3 → Use frontend-phase-3 subagent
- Phase 4 → Use backend-phase-4 subagent
- Phase 5 → Use backend-phase-5 subagent
- Phase 6 → Use backend-phase-6 subagent
- Phase 7 → Use integration-phase-7 subagent

4. After completion, update plan with checkmarks
```

---

## Execution Order

### Part 1: Repository Setup ✅ COMPLETE

1. ✅ Run Nx workspace creation command
2. ✅ Add planning documents to docs/
3. ✅ Add plugins (@nx/next, @nx/nest, @nx/vite)
4. ✅ Generate apps (web, api)
5. ✅ Generate shared library
6. ✅ Install dependencies
7. ✅ Configure Vitest
8. ✅ Configure Drizzle
9. ✅ Create Docker Compose
10. ✅ Add package.json scripts
11. ✅ Configure pre-commit hooks (Husky + lint-staged)
12. ✅ Test build/test/lint/typecheck commands

**Status:** All 12 steps complete. Repository is fully functional:

- Web app: `pnpm dev:web` → http://localhost:3000
- API app: `pnpm dev:api` → http://localhost:3001/api
- Both: `pnpm dev` → runs both apps
- All commands verified: build ✅, test ✅, lint ✅, typecheck ✅

### Part 2: AI Workflow Setup 🔄 IN PROGRESS

1. ✅ Update CLAUDE.md with project rules (keep Nx section)
2. ✅ Create AI-WORKFLOW.md with diagrams
3. 🔄 Create slash commands (story, plan, implement, commit, pr)

- [x] `/commit` - Conventional commits with Claude Code attribution
- [x] `/prd` - Product requirements document
- [x] `/story` - User stories with BDD scenarios
- [x] `/plan` - 7-phase implementation planning
- [ ] `/implement` - Phase dispatcher
- [ ] `/pr` - Pull request creation (using GitHub CLI)

4. ⬜ Create phase subagents (7 agents)

- [ ] frontend-phase-1: Presentational UI
- [ ] frontend-phase-2: API Client + Mocks
- [ ] frontend-phase-3: Smart Components
- [ ] backend-phase-4: Repository (TDD)
- [ ] backend-phase-5: Service Layer (TDD)
- [ ] backend-phase-6: Controllers (TDD)
- [ ] integration-phase-7: Frontend-Backend Integration
- [ ] Ensure that the /implement command explicitly calls out the right agent to use for a given plan phase

5. ⬜ Create skills

- [ ] nextjs-patterns/SKILL.md
- [ ] nestjs-architecture/SKILL.md
- [ ] drizzle-repository/SKILL.md
- [ ] vitest-testing/SKILL.md
- [ ] testcontainers/SKILL.md
- [ ] bff-patterns/SKILL.md
- [ ] Ensure that each subagent has the right skills autoloaded

6. ⬜ Test workflow end-to-end

---

## Key Differences from Cursor Command-Based Workflow

| Aspect               | Cursor (Command-Based)           | Claude Code (Subagent-Based)          |
| -------------------- | -------------------------------- | ------------------------------------- |
| Phase implementation | Commands read rules files        | Subagents with isolated context       |
| Rule organization    | Multiple `.mdc` files            | Single `CLAUDE.md` + subagents        |
| Skill/Rule loading   | Glob patterns                    | Skills explicitly loaded by subagents |
| Phase dispatch       | Command parses and applies rules | Command invokes specialized subagents |
| Context control      | File-based inclusion             | Subagent isolation                    |

## Benefits of Claude Code Subagent Approach

1. **Better isolation**: Each phase subagent has its own context window
2. **Explicit skills**: Skills loaded only when needed by subagents
3. **Simpler maintenance**: One CLAUDE.md vs many .mdc files
4. **Native integration**: Uses Claude Code's built-in subagent system
5. **Model flexibility**: Can use Haiku for fast phases, Sonnet for complex
