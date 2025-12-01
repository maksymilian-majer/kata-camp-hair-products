# Hair Product Scanner

An AI-powered hair product ingredient scanner that helps users analyze product compatibility with their hair type. Built as a training kata for AI-assisted development workflows.

## Development

### Option 1: Docker Development (Recommended for Training)

Dev servers run in containers with hot reload.

```bash
# First time setup
docker compose up --build

# Subsequent runs
docker compose up

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# Database: localhost:5432
```

**After installing new packages:** Rebuild containers to update dependencies.

```bash
pnpm install                  # Update lockfile on host
docker compose up --build     # Rebuild with new dependencies
```

### Option 2: Local Development

Run Node.js locally with only PostgreSQL in Docker.

```bash
# Copy environment file
cp .env.example .env

# Use correct Node.js version
nvm use

# Install dependencies
pnpm install

# Start database only
docker compose up postgres

# Start development servers (in separate terminal)
pnpm dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## Prerequisites

### Required Software

| Tool    | Version | Installation                                                                                        |
| ------- | ------- | --------------------------------------------------------------------------------------------------- |
| Node.js | 24+     | Via nvm (see below)                                                                                 |
| pnpm    | 10+     | `npm install -g pnpm@latest-10` or use [corepack](https://pnpm.io/next/installation#using-corepack) |
| Docker  | Latest  | [Docker Desktop](https://www.docker.com/products/docker-desktop/)                                   |
| Git     | Latest  | [git-scm.com](https://git-scm.com/)                                                                 |

### Node.js Setup with nvm

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Install and use correct Node.js version (reads from .nvmrc)
nvm install
nvm use
```

### Windows Users

**Windows Subsystem for Linux (WSL) is required.** This project does not support native Windows development.

1. Install WSL: `wsl --install`
2. Install Ubuntu from Microsoft Store
3. Follow the Linux installation steps inside WSL

## Project Structure

```
hair-product-scanner/
├── apps/
│   ├── web/                 # Next.js 16 frontend
│   │   └── src/
│   │       ├── app/         # App Router pages
│   │       ├── components/  # React components
│   │       └── hooks/       # Custom hooks
│   └── api/                 # NestJS 11 backend
│       └── src/
│           ├── database/    # Drizzle schema & migrations
│           └── modules/     # Feature modules
├── libs/
│   ├── ui/                  # shadcn/ui component library
│   │   └── src/
│   │       ├── components/  # UI components (Button, etc.)
│   │       └── styles/      # Global CSS & theme
│   └── shared/              # Shared types and Zod schemas
├── docs/                    # Documentation
├── .claude/                 # AI workflow configuration
│   ├── commands/            # Slash commands (/story, /plan, etc.)
│   ├── agents/              # Phase subagents
│   └── skills/              # Reusable knowledge
└── docker-compose.yml       # Local PostgreSQL
```

## Technology Stack

| Layer         | Technology     | Purpose                             |
| ------------- | -------------- | ----------------------------------- |
| Monorepo      | Nx 22          | Build system, caching, task running |
| Frontend      | Next.js 16     | React framework with App Router     |
| Backend       | NestJS 11      | Node.js API framework               |
| Database      | PostgreSQL 16  | Relational database                 |
| ORM           | Drizzle        | Type-safe SQL query builder         |
| Styling       | Tailwind 4.1   | Utility-first CSS                   |
| UI Components | shadcn/ui      | Accessible component library        |
| Server State  | TanStack Query | Data fetching & caching             |
| Client State  | Zustand        | Lightweight state management        |
| Testing       | Vitest         | Fast unit & integration tests       |
| DB Testing    | Testcontainers | Real PostgreSQL in tests            |
| API Mocking   | MSW            | Mock Service Worker for frontend    |

## Development Commands

### Daily Development

```bash
# Start all dev servers
pnpm dev

# Start only frontend
pnpm dev:web

# Start only backend
pnpm dev:api
```

### Quality Checks

```bash
# Run all checks (lint, test, build)
pnpm check-all

# Individual checks
pnpm lint        # ESLint
pnpm test        # Vitest
pnpm build       # Production build
pnpm typecheck   # TypeScript
```

### Database

```bash
# Generate migration from schema changes
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (database browser)
pnpm db:studio
```

### Nx Commands

```bash
# Run specific target for a project
pnpm nx <target> <project>

# Examples
pnpm nx build web
pnpm nx test api
pnpm nx lint ui

# View project graph
pnpm nx graph

# Show project details
pnpm nx show project web
```

## UI Components (shadcn/ui)

Components live in `libs/ui`. To add new shadcn components, run from the project root:

```bash
# Add a component (from root directory)
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add dialog
```

Components are automatically placed in `libs/ui/src/components/`. After adding, export from `libs/ui/src/index.ts`:

```typescript
export { Card, CardContent, CardHeader } from './components/card';
```

Use in your app:

```typescript
import { Button, Card, cn } from '@hair-product-scanner/ui';
```

## AI-Assisted Development Workflow

This project includes a structured 7-phase workflow for AI-assisted development using Claude Code.

### Required Plugin

The frontend phases (Phase 1) require the frontend design plugin for high-quality UI generation:

```bash
# Add the Anthropic marketplace
/plugin marketplace add anthropics/claude-code

# Install the frontend design plugin
/plugin install frontend-design@claude-code-plugins
```

### Available Commands

| Command              | Purpose                              |
| -------------------- | ------------------------------------ |
| `/story [ID] [desc]` | Create user story with BDD scenarios |
| `/plan [ID]`         | Generate 7-phase implementation plan |
| `/implement Phase N` | Execute phase with specialized agent |
| `/commit`            | Create conventional commit           |
| `/pr`                | Create pull request                  |

### Workflow Overview

```
Planning:     /story → /plan
Implementation: /implement + @plan (autodetects phase)
  Frontend:     Phase 1 (UI) → Phase 2 (API Client) → Phase 3 (Smart Components)
  Backend:      Phase 4 (Repository) → Phase 5 (Service) → Phase 6 (Controller)
  Integration:  Phase 7 (Connect Frontend to Backend)
Delivery:     /commit → /pr
```

See [AI-WORKFLOW.md](./AI-WORKFLOW.md) for detailed documentation.

## Architecture

### Frontend (Next.js)

- **App Router** with Server Components by default
- **TanStack Query** for server state (API calls)
- **Zustand** for client state (UI state)
- **React Hook Form + Zod** for form validation

### Backend (NestJS)

Uses Clean Architecture pattern:

```
Controller → Service → Repository → Database
     ↓           ↓
   DTOs      Business Logic
```

- **Controllers** - HTTP handlers, thin layer
- **Services** - Business logic
- **Repositories** - Data access with Drizzle
- **Shared types** - API contracts in `libs/shared`

### Testing Strategy

| Layer      | Testing Approach            | Tools                    |
| ---------- | --------------------------- | ------------------------ |
| Frontend   | Integration tests           | Vitest + Testing Library |
| Repository | Integration tests (real DB) | Vitest + Testcontainers  |
| Service    | Unit tests (mocked repos)   | Vitest                   |
| Controller | E2E tests                   | Vitest + Supertest       |

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Project guidelines and conventions
- [AI-WORKFLOW.md](./AI-WORKFLOW.md) - 7-phase delivery workflow
- [docs/TRAINING-REQUIREMENTS.md](./docs/TRAINING-REQUIREMENTS.md) - Full training context

## Git Conventions

This project uses conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Adding tests
- `refactor:` - Code change without feature/fix
- `docs:` - Documentation
- `chore:` - Maintenance

Use `/commit` command for AI-attributed commits.

## License

MIT
