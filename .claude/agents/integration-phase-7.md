---
name: integration-phase-7
description: |
  Phase 7: Frontend-Backend Integration. Connect the frontend to the real backend API,
  remove/disable MSW mocks, and perform manual testing of all BDD scenarios.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nextjs-patterns
  - nestjs-architecture
  - bff-patterns
---

# Phase 7: Frontend-Backend Integration

Connect the frontend to the real backend API. Remove or conditionally disable MSW mocks. Perform manual testing.

## What You Do

- Remove or disable MSW mocks for integrated endpoints
- Update API client to use real backend URLs
- Test all BDD scenarios manually
- Fix any integration issues
- Run `pnpm check-all` to verify everything works

## What You DON'T Do

- No new features (Phases 1-6)
- No new tests (existing tests should still pass)
- No major refactoring

## Step 1: Configure API Base URL

```typescript
// apps/web/src/lib/api/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

## Step 2: Update API Client

```typescript
// apps/web/src/lib/api/client.ts
import { API_BASE_URL } from './config';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## Step 3: Update TanStack Query Hooks

```typescript
// apps/web/src/lib/api/hooks/useHairProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { HairProfile, CreateHairProfileRequest } from '@hair-product-scanner/shared';

const QUERY_KEY = ['hair-profile'] as const;

export function useHairProfile() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await apiClient<HairProfile>('/api/hair-profile');
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useCreateHairProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHairProfileRequest) =>
      apiClient<HairProfile>('/api/hair-profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
```

## Step 4: Configure MSW for Hybrid Mode

MSW should always run with `onUnhandledRequest: 'bypass'`. This means:

- Requests **with** handlers → mocked by MSW
- Requests **without** handlers → pass through to real backend

This allows you to incrementally integrate endpoints while keeping MSW available for future features.

### Keep MSW Running

```typescript
// apps/web/src/app/providers.tsx
'use client';

import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      if (process.env.NODE_ENV === 'development') {
        const { worker } = await import('@/mocks/browser');
        await worker.start({
          onUnhandledRequest: 'bypass',
        });
      }
      setReady(true);
    }
    enableMocking();
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
```

### Unregister Handlers for Integrated Endpoints

When an endpoint is implemented on the real backend, **comment out** (don't delete) its MSW handler registration:

```typescript
// apps/web/src/mocks/handlers/index.ts

// Health endpoint is integrated with real backend - handler not registered
// import { healthHandlers } from './health';

// Future endpoints still being developed:
import { scanHandlers } from './scan';

export const handlers = [
  // ...healthHandlers,  // Integrated - uses real API
  ...scanHandlers,
];
```

**Why comment out instead of delete?**

- Keep handler files as reference for test setup
- Easy to re-enable for debugging
- Documents which endpoints have been integrated

**Why this approach?**

- MSW stays available for developing new features
- Real endpoints work without any env flag changes
- Easy to add temporary mocks for endpoints not yet implemented

### Update Tests for Integrated Endpoints

When an endpoint is integrated and its handler is unregistered, tests must set up their own handlers:

```tsx
// apps/web/src/app/page.spec.tsx
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { server } from '../mocks/server';

describe('Home', () => {
  // Set up default handler for all tests in this describe block
  beforeEach(() => {
    server.use(http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })));
  });

  it('shows connected status when API returns ok', async () => {
    // Uses beforeEach handler
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });

  it('shows disconnected status when API returns error status', async () => {
    // Override with error response
    server.use(http.get('*/api/health', () => HttpResponse.json({ status: 'error' })));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  it('shows disconnected status when API fails with 500', async () => {
    // Override with 500 error
    server.use(http.get('*/api/health', () => new HttpResponse(null, { status: 500 })));
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });
});
```

**Test coverage for API responses:**

1. `{ status: 'ok' }` → Shows "Connected"
2. `{ status: 'error' }` → Shows "Disconnected" (DB issue)
3. HTTP 500 → Shows "Disconnected" (server error)

## Step 5: Environment Configuration

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# apps/web/.env.development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 6: Manual Testing Checklist

Test each BDD scenario from the story:

### Example: Hair Profile Quiz

```gherkin
Scenario: New user completes quiz successfully
Given I am a new user on the home page
When I tap "Get Started"
And I select my hair type as "Curly"
And I select my concerns as "Frizz" and "Dryness"
And I select my goals as "Moisturize"
And I submit the quiz
Then I should see the scanner screen
And my profile should be saved
```

**Manual Test Steps:**

1. [ ] Start both servers: `pnpm dev`
2. [ ] Open http://localhost:3000 in browser
3. [ ] Click "Get Started" button
4. [ ] Select "Curly" hair type
5. [ ] Select "Frizz" and "Dryness" concerns
6. [ ] Select "Moisturize" goal
7. [ ] Submit the quiz
8. [ ] Verify scanner screen appears
9. [ ] Verify profile saved (check database or network tab)

### Error Scenarios

```gherkin
Scenario: Handle network error gracefully
Given I am completing the quiz
When the network fails during submission
Then I should see an error message
And I should be able to retry
```

**Manual Test Steps:**

1. [ ] Complete quiz to submission step
2. [ ] Disable network (DevTools > Network > Offline)
3. [ ] Click submit
4. [ ] Verify error message appears
5. [ ] Re-enable network
6. [ ] Click retry
7. [ ] Verify submission succeeds

## Step 7: Fix Integration Issues

Common issues and fixes:

### CORS Errors

```typescript
// apps/api/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(3001);
}
```

### Type Mismatches

Ensure backend response matches frontend types:

```typescript
// Check backend response
console.log('Backend response:', response);

// Compare with expected type
const expected: HairProfile = {
  id: string,
  hairType: 'curly' | 'wavy' | 'straight' | 'coily',
  concerns: string[],
  goals: string[],
  createdAt: string,
};
```

### Authentication Issues

Ensure the user is authenticated and `req.user` is populated. See boilerplate improvements for Passport authentication setup.

## Step 8: Run Final Validation

```bash
# Run all checks
pnpm check-all

# This runs:
# - pnpm lint (ESLint)
# - pnpm test (Vitest)
# - pnpm build (Next.js + NestJS build)
```

## Step 9: Clean Up

Remove or archive development artifacts:

```typescript
// Remove dev preview routes
// apps/web/src/app/_dev/ → Delete or add to .gitignore

// Remove console.logs
// Search: console.log
// Replace: (remove or comment)

// Remove TODO comments
// Search: // TODO
// Address or remove each one
```

## Completion Checklist

- [ ] API base URL configured
- [ ] API client updated to use real endpoints
- [ ] MSW handlers removed for integrated endpoints (bypass to real API)
- [ ] All BDD scenarios tested manually
- [ ] CORS configured on backend
- [ ] Error scenarios handled gracefully
- [ ] No console errors in browser
- [ ] `pnpm check-all` passes
- [ ] Development artifacts cleaned up

## Troubleshooting

### Backend Not Running

```bash
# Check if API is running
curl http://localhost:3001/api/health

# If not, start it
pnpm dev
```

### Database Not Running

```bash
# Check Docker containers
docker ps

# Start database
docker-compose up -d postgres
```

### Tests Failing After Integration

```bash
# Run tests in watch mode to debug
pnpm nx test web --watch
pnpm nx test api --watch
```

### Type Errors

```bash
# Check types across workspace
pnpm nx run-many --target=typecheck
```
