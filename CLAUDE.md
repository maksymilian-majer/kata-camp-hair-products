# Hair Product Scanner - Project Guidelines

## Project Overview

A hair product ingredient scanner that helps users analyze product compatibility with their hair type. Built as a training kata for AI-assisted development workflows.

**Stack:**

- Frontend: Next.js 16 (App Router, Tailwind 4.1)
- Backend: NestJS 11 (SWC)
- Database: PostgreSQL 16 + Drizzle ORM
- Testing: Vitest + Testcontainers
- Monorepo: Nx 22

## Architecture Philosophy

This project uses **Anemic Domain Model** (not DDD):

- Simple data transfer objects (DTOs)
- Business logic in service layer
- No domain events or aggregates
- Explicit SQL-like queries with Drizzle

**Layer Flow:**

```
Controller → Service → Repository → Database
     ↓           ↓
   DTOs      Business Logic
```

## Project Structure

```
apps/
├── web/                 # Next.js 16 frontend
│   └── app/            # App Router pages
└── api/                # NestJS 11 backend
    └── src/
        ├── database/   # Drizzle schema & migrations
        └── app/        # NestJS modules

libs/
└── shared/             # Shared types and Zod schemas
    └── src/
        ├── types/      # TypeScript interfaces
        └── schemas/    # Zod validation schemas
```

## Code Conventions

### General

- Use `@hair-product-scanner/shared` for shared types
- No comments unless explicitly requested
- No emojis in code
- Prefer explicit over implicit

### Frontend (Next.js)

- Use Server Components by default
- Add `'use client'` only when needed (hooks, events)
- Forms: React Hook Form + Zod schemas from shared lib
- State: Zustand for client state, TanStack Query for server state

### Backend (NestJS)

- Repository pattern for data access
- Services contain business logic
- Controllers are thin (validation + delegation)
- Use Drizzle query builder (no raw SQL, no ORM magic)

### Testing

- Frontend: Test after implementation
- Backend: Test-first (inside-out TDD)
  - Phase 4: Repository tests with Testcontainers
  - Phase 5: Service tests with mocked repositories
  - Phase 6: Controller E2E tests with Supertest

Tests with Testcontainers work both locally and inside Docker. The docker-compose.yml mounts the Docker socket to enable sibling containers for testcontainers.

## Running Commands

### Local Development (Node.js installed)

If you have Node.js and pnpm installed locally:

```bash
pnpm nx test api
pnpm dlx shadcn@latest add button
```

### Docker-Only Development (No local Node.js)

If pnpm commands fail or you don't have Node.js installed locally, prefix commands with `docker compose exec dev`:

```bash
# Start the dev container first (if not running)
docker compose up -d

# Then run commands inside the container
docker compose exec dev pnpm nx test api
docker compose exec dev pnpm dlx shadcn@latest add button
docker compose exec dev pnpm check-all
```

This works for all pnpm/nx commands including:

- `pnpm nx test <project>`
- `pnpm nx build <project>`
- `pnpm nx lint <project>`
- `pnpm dlx shadcn@latest add <component>`
- `pnpm db:migrate`

## Git Conventions

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `test:` Adding tests
- `refactor:` Code change without feature/fix
- `docs:` Documentation
- `chore:` Maintenance

Use `/commit` command for AI-attributed commits.

## 7-Phase Delivery Process

When implementing features, follow the 7-phase approach:

1. **Phase 1**: Presentational UI (pure components, no logic)
2. **Phase 2**: API Client + Mocks (TanStack Query hooks, MSW)
3. **Phase 3**: Smart Components (connect UI to state)
4. **Phase 4**: Repository Layer (TDD with Testcontainers)
5. **Phase 5**: Service Layer (TDD with mocked repos)
6. **Phase 6**: Controllers (TDD with Supertest)
7. **Phase 7**: Integration (connect frontend to real API)

Use `/implement Phase N` to execute each phase with specialized subagents.

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
