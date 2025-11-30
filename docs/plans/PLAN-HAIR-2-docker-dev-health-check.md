# Implementation Plan: Docker Development Environment + Health Check

**Story**: HAIR-2
**Created**: 2025-11-30
**Type**: Technical/Infrastructure

## Overview

Set up Docker Compose for full-stack local development with hot reload, and add a health check badge to the frontend that verifies database connectivity via a new HealthController.

## Goals

1. Enable `docker compose up` to start the full development environment (web + api + db)
2. Ensure file changes on host trigger hot reload in containers
3. Add shadcn Badge component showing API/DB connection status
4. Create HealthController with direct Drizzle query (no repository/service layers)

---

## Phase 0: Docker Compose Development Setup

**Type**: Infrastructure
**Testing**: Manual verification

### Tasks

- [ ] Update `docker-compose.yml` to add `web` and `api` services
- [ ] Configure volume mounts for source code sync
- [ ] Add polling environment variables for hot reload (`WATCHPACK_POLLING`, `CHOKIDAR_USEPOLLING`)
- [ ] Set services to use Node 24 image
- [ ] Configure network for inter-service communication
- [ ] Bind dev servers to `0.0.0.0` for container accessibility
- [ ] Create `.env.example` with required variables
- [ ] Update `README.md` with Docker vs local development instructions

### docker-compose.yml Changes

```yaml
services:
  postgres:
    # ... existing config ...
    networks:
      - hair-scanner-network

  api:
    image: node:24-bookworm
    container_name: hair-scanner-api
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    ports:
      - '3001:3001'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/hair_scanner
      - PORT=3001
      - WATCHPACK_POLLING=true
      - CHOKIDAR_USEPOLLING=1
    command: sh -c "corepack enable && pnpm install && pnpm dev:api"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - hair-scanner-network

  web:
    image: node:24-bookworm
    container_name: hair-scanner-web
    working_dir: /app
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - WATCHPACK_POLLING=true
      - CHOKIDAR_USEPOLLING=1
    command: sh -c "corepack enable && pnpm install && pnpm dev:web"
    depends_on:
      - api
    networks:
      - hair-scanner-network

networks:
  hair-scanner-network:
    driver: bridge

volumes:
  postgres_data:
  node_modules:
```

### .env.example

```env
# Database - works for both local and Docker development
# Local: localhost (when running pnpm dev with docker compose up postgres)
# Docker: postgres (Docker service name, set in docker-compose.yml)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hair_scanner

# API
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note**: `localhost` works for local development. Docker Compose overrides `DATABASE_URL` with `postgres` hostname for the api service.

### Server Binding Updates

**apps/api/src/main.ts** - Bind to all interfaces:

```typescript
await app.listen(port, '0.0.0.0');
```

### README.md Updates

Add section explaining both development approaches:

````markdown
## Development

### Option 1: Docker Development (Recommended for Training)

Everything runs in containers - no local Node.js required (except for IDE support).

```bash
# Start all services with hot reload
docker compose up

# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# Database: localhost:5432
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
```
````

### Completion Criteria

- [ ] `docker compose up` starts all services successfully
- [ ] Hot reload works for both frontend and backend in Docker
- [ ] `pnpm dev` works with `docker compose up postgres`
- [ ] README documents both approaches

---

## Phase 1: Presentational UI Components

**Subagent**: `frontend-phase-1`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Install Badge component via shadcn CLI: `pnpm dlx shadcn@latest add badge`
- [ ] Export Badge from `libs/ui/src/index.ts`
- [ ] Create `HealthBadge` presentational component in `apps/web/components/health-badge.tsx`

### Component Structure

```tsx
// apps/web/components/health-badge.tsx
import { Badge } from '@hair-product-scanner/ui';

interface HealthBadgeProps {
  status: 'loading' | 'connected' | 'disconnected';
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const variants = {
    loading: { variant: 'secondary' as const, label: 'Checking...' },
    connected: { variant: 'default' as const, label: 'Connected' },
    disconnected: { variant: 'destructive' as const, label: 'Disconnected' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}
```

### Completion Criteria

- [ ] Badge component installed and exported from UI lib
- [ ] HealthBadge component created with status prop
- [ ] Component viewable in isolation

---

## Phase 2: API Client + Mocks

**Subagent**: `frontend-phase-2`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Create `apps/web/app/env.ts` for centralized environment configuration
- [ ] Define health check types in `@hair-product-scanner/shared`
- [ ] Create `useHealthCheck` TanStack Query hook
- [ ] Set up MSW handler for `/api/health` endpoint
- [ ] Create QueryClientProvider wrapper

### Environment Configuration

```typescript
// apps/web/app/env.ts
export const env = {
  BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
} as const;
```

### Types (shared lib)

```typescript
// libs/shared/src/types/health.types.ts
export interface HealthResponse {
  status: 'ok' | 'error';
}
```

### QueryClientProvider Setup

```tsx
// apps/web/components/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### useHealthCheck Hook

```typescript
// apps/web/hooks/use-health-check.ts
import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@hair-product-scanner/shared';
import { env } from '../app/env';

export function useHealthCheck() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${env.BACKEND_URL}/api/health`);
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    },
    refetchInterval: 10000,
    retry: false,
  });
}
```

### MSW Handler

```typescript
// apps/web/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
```

### Completion Criteria

- [ ] Types defined in shared library
- [ ] Query hook created and working
- [ ] MSW mock returns realistic data
- [ ] QueryClientProvider wraps the app

---

## Phase 3: Smart Components + Integration

**Subagent**: `frontend-phase-3`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Update `apps/web/app/layout.tsx` to include Providers
- [ ] Update `apps/web/app/page.tsx` to use HealthBadge with real data
- [ ] Connect presentational component to query hook

### Updated layout.tsx

```tsx
// apps/web/app/layout.tsx
import '@hair-product-scanner/ui/styles/globals.css';
import { Providers } from '../components/providers';

export const metadata = {
  title: 'Hair Product Scanner',
  description: 'Analyze hair product ingredients',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Updated page.tsx

```tsx
'use client';

import { Button, toast, Toaster } from '@hair-product-scanner/ui';
import { HealthBadge } from '../components/health-badge';
import { useHealthCheck } from '../hooks/use-health-check';

export default function Home() {
  const { data, isLoading } = useHealthCheck();

  const status = isLoading ? 'loading' : data?.status === 'ok' ? 'connected' : 'disconnected';

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Hairminator</h1>
          <HealthBadge status={status} />
        </div>
        <p className="text-muted-foreground">Analyze hair product ingredients for your hair type</p>
        <Button onClick={() => toast.success('shadcn/ui is working!')}>Test Toast</Button>
      </div>
      <Toaster />
    </div>
  );
}
```

### Completion Criteria

- [ ] Feature works end-to-end with mocked API
- [ ] Badge displays correct status based on mock response
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 6: HTTP Controller

**Subagent**: `backend-phase-6`
**Testing**: Write E2E test FIRST (Supertest)

**Note**: Phases 4 (Repository) and 5 (Service) are skipped - the HealthController uses Drizzle directly as a simple infrastructure check.

### Tasks

- [ ] Write E2E test for health endpoint FIRST
- [ ] Create `apps/api/src/app/health.controller.ts`
- [ ] Register controller in AppModule
- [ ] Enable CORS for frontend requests
- [ ] Update main.ts to bind to 0.0.0.0

### Test Scenarios (Write BEFORE Implementation)

```typescript
// apps/api/src/app/health.controller.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';

describe('GET /api/health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return status ok when database is connected', async () => {
    const response = await request(app.getHttpServer()).get('/api/health').expect(200);

    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

### HealthController Implementation

```typescript
// apps/api/src/app/health.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, DrizzleDB } from '../database';

@Controller('health')
export class HealthController {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  @Get()
  async check() {
    try {
      await this.db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      return { status: 'error' };
    }
  }
}
```

### AppModule Update

```typescript
// apps/api/src/app/app.module.ts
import { HealthController } from './health.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
```

### main.ts Updates

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000'],
  });

  const port = process.env.PORT || 3001;
  // Bind to all interfaces for Docker
  await app.listen(port, '0.0.0.0');
  Logger.log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}
```

### Completion Criteria

- [ ] E2E test written and passing
- [ ] Controller implementation complete
- [ ] CORS enabled for frontend
- [ ] All tests pass: `pnpm nx test api`

---

## Phase 7: Frontend-Backend Integration

**Subagent**: `integration-phase-7`
**Testing**: Manual testing of complete flow

### Tasks

- [ ] Remove/disable MSW mocks for health endpoint
- [ ] Configure API URL via environment variable
- [ ] Test complete flow with Docker
- [ ] Test complete flow with local development
- [ ] Fix any integration issues

### Verification Checklist

**Docker Development:**

- [ ] Run `docker compose up`
- [ ] Open http://localhost:3000
- [ ] Badge shows "Connected" (green)
- [ ] Stop postgres: `docker compose stop postgres`
- [ ] Badge shows "Disconnected" (red)
- [ ] Restart postgres: `docker compose start postgres`
- [ ] Badge recovers to "Connected"

**Local Development:**

- [ ] Run `docker compose up postgres`
- [ ] Run `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Badge shows "Connected" (green)

**Hot Reload:**

- [ ] Edit file in `apps/web` - Next.js reloads
- [ ] Edit file in `apps/api` - NestJS reloads

### Completion Criteria

- [ ] Frontend connected to real backend
- [ ] Both development modes work
- [ ] Hot reload works in Docker
- [ ] No console errors
- [ ] Ready for PR

---

## Critical Files to Modify

| File                                         | Change                                       |
| -------------------------------------------- | -------------------------------------------- |
| `docker-compose.yml`                         | Add web, api services with volume mounts     |
| `.env.example`                               | Create with required variables               |
| `README.md`                                  | Add Docker vs local development instructions |
| `apps/api/src/main.ts`                       | Bind to 0.0.0.0, enable CORS                 |
| `apps/api/src/app/app.module.ts`             | Register HealthController                    |
| `apps/api/src/app/health.controller.ts`      | Create new file                              |
| `apps/api/src/app/health.controller.spec.ts` | Create E2E test                              |
| `libs/shared/src/types/health.types.ts`      | Create health types                          |
| `libs/ui/src/index.ts`                       | Export Badge component                       |
| `libs/ui/src/components/badge.tsx`           | Created by shadcn CLI                        |
| `apps/web/app/env.ts`                        | Create centralized env configuration         |
| `apps/web/components/providers.tsx`          | Create QueryClientProvider                   |
| `apps/web/components/health-badge.tsx`       | Create presentational component              |
| `apps/web/hooks/use-health-check.ts`         | Create query hook                            |
| `apps/web/mocks/handlers.ts`                 | Create MSW handlers                          |
| `apps/web/app/layout.tsx`                    | Wrap with Providers                          |
| `apps/web/app/page.tsx`                      | Add HealthBadge                              |

---

## Completion Criteria

- [ ] `docker compose up` starts all services successfully
- [ ] `pnpm dev` + `docker compose up postgres` works
- [ ] Hot reload works in Docker for both frontend and backend
- [ ] Health badge displays correct status
- [ ] All tests pass: `pnpm check-all`
