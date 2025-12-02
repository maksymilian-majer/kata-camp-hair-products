---
name: frontend-phase-2
description: |
  Phase 2: API Client + Mocks. Create TanStack Query hooks, MSW mock handlers,
  and shared types. No component connections yet - that's Phase 3.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nextjs-patterns
  - vitest-testing
---

# Phase 2: API Client + Mocks

Build the data fetching layer with TanStack Query hooks and MSW mocks. Define shared types. No component connections yet.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { hairProfileHandlers } from './hair-profile'`)
- **Parent/other folders**: Use `@/web/` alias (e.g., `import { apiClient } from '@/web/lib/api/client'`)
- **Shared libs**: Use package imports (e.g., `import type { HairProfile } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/web/` alias

## What You Build

- Shared types in `@hair-product-scanner/shared`
- Zod schemas for validation
- TanStack Query hooks (queries and mutations)
- MSW handlers with realistic mock data

## What You DON'T Build

- No component connections (Phase 3)
- No real API calls (mocked with MSW)
- No Zustand stores (Phase 3)
- No UI changes

## Shared Types

Define types in the shared library:

```typescript
// libs/shared/src/types/feature-name.ts
export type HairType = 'straight' | 'wavy' | 'curly' | 'coily';

export type HairProfile = {
  id: string;
  hairType: HairType;
  concerns: string[];
  goals: string[];
  createdAt: string;
};

export type CreateHairProfileRequest = {
  hairType: HairType;
  concerns: string[];
  goals: string[];
};

export type CreateHairProfileResponse = {
  profile: HairProfile;
};
```

## Zod Schemas

Create validation schemas that match types:

```typescript
// libs/shared/src/schemas/feature-name.ts
import { z } from 'zod';

export const hairTypeSchema = z.enum(['straight', 'wavy', 'curly', 'coily']);

export const hairProfileSchema = z.object({
  id: z.string(),
  hairType: hairTypeSchema,
  concerns: z.array(z.string()),
  goals: z.array(z.string()),
  createdAt: z.string(),
});

export const createHairProfileRequestSchema = z.object({
  hairType: hairTypeSchema,
  concerns: z.array(z.string()).min(1),
  goals: z.array(z.string()).min(1),
});
```

## API Client Structure

```
apps/web/
└── lib/
    └── api/
        ├── client.ts           # Base fetch client
        ├── hooks/
        │   └── useHairProfile.ts
        └── types.ts            # Re-export from shared
```

## TanStack Query Hooks

### Query Hook Pattern

```typescript
// apps/web/lib/api/hooks/useHairProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { HairProfile, CreateHairProfileRequest } from '@hair-product-scanner/shared';

const QUERY_KEY = ['hair-profile'] as const;

async function fetchHairProfile(): Promise<HairProfile | null> {
  const response = await fetch('/api/hair-profile');
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
}

export function useHairProfile() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchHairProfile,
  });
}
```

### Mutation Hook Pattern

```typescript
async function createHairProfile(data: CreateHairProfileRequest): Promise<HairProfile> {
  const response = await fetch('/api/hair-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create profile');
  return response.json();
}

export function useCreateHairProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHairProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });
}
```

## MSW Mock Handlers

### Setup Structure

```
apps/web/
└── mocks/
    ├── browser.ts          # Browser MSW setup
    ├── handlers/
    │   ├── index.ts        # Export all handlers
    │   └── hair-profile.ts # Feature handlers
    └── data/
        └── hair-profile.ts # Mock data
```

### Handler Pattern

```typescript
// apps/web/mocks/handlers/hair-profile.ts
import { http, HttpResponse, delay } from 'msw';
import type { HairProfile, CreateHairProfileRequest } from '@hair-product-scanner/shared';

let mockProfile: HairProfile | null = null;

export const hairProfileHandlers = [
  http.get('/api/hair-profile', async () => {
    await delay(300);
    if (!mockProfile) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(mockProfile);
  }),

  http.post('/api/hair-profile', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as CreateHairProfileRequest;

    mockProfile = {
      id: crypto.randomUUID(),
      hairType: body.hairType,
      concerns: body.concerns,
      goals: body.goals,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockProfile, { status: 201 });
  }),
];
```

### Combine Handlers

```typescript
// apps/web/mocks/handlers/index.ts
import { hairProfileHandlers } from './hair-profile';

export const handlers = [...hairProfileHandlers];
```

### Browser Setup

```typescript
// apps/web/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

## Mock Data

```typescript
// apps/web/mocks/data/hair-profile.ts
import type { HairProfile } from '@hair-product-scanner/shared';

export const mockHairProfiles: HairProfile[] = [
  {
    id: '1',
    hairType: 'curly',
    concerns: ['frizz', 'dryness'],
    goals: ['moisturize', 'define-curls'],
    createdAt: '2024-01-15T10:00:00Z',
  },
];

export const hairTypeOptions = [
  { value: 'straight', label: 'Straight', description: 'Little to no wave' },
  { value: 'wavy', label: 'Wavy', description: 'S-shaped waves' },
  { value: 'curly', label: 'Curly', description: 'Spiral curls' },
  { value: 'coily', label: 'Coily', description: 'Tight coils or zigzag' },
];
```

## Testing (After Implementation)

Test hooks with MSW:

```typescript
// apps/web/lib/api/hooks/useHairProfile.spec.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHairProfile } from './useHairProfile';

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useHairProfile', () => {
  it('returns null when no profile exists', async () => {
    const { result } = renderHook(() => useHairProfile(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
```

## Index Exports

```typescript
// libs/shared/src/types/index.ts
export * from './feature-name';

// libs/shared/src/schemas/index.ts
export * from './feature-name';

// apps/web/lib/api/hooks/index.ts
export * from './useHairProfile';
```

## Completion Checklist

- [ ] Types defined in `@hair-product-scanner/shared`
- [ ] Zod schemas created and exported
- [ ] TanStack Query hooks implemented
- [ ] MSW handlers set up with realistic mocks
- [ ] Tests written for hooks
- [ ] `pnpm check-all` passes
