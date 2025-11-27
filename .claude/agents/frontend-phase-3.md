---
name: frontend-phase-3
description: |
  Phase 3: Smart Components + State. Connect presentational components to API hooks,
  add Zustand stores, implement forms with React Hook Form + Zod, handle loading/error states.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
---

# Phase 3: Smart Components + State

Connect presentational components to the mocked API. Add state management and forms.

## What You Build

- Smart wrapper components that fetch data
- Custom hooks for complex business logic
- Zustand stores for client-side state
- Forms with React Hook Form + Zod
- Loading, error, and empty states

## What You DON'T Build

- No new presentational components (Phase 1)
- No new API hooks (Phase 2)
- No real backend connection (Phase 7)

## Smart vs Presentational Pattern

```tsx
// Presentational (Phase 1) - receives data via props
function HairProfileCard({ profile, onEdit }: HairProfileCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2>{profile.hairType}</h2>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

// Smart (Phase 3) - fetches data, passes to presentational
function HairProfileCardContainer() {
  const { data: profile, isLoading, error } = useHairProfile();
  const router = useRouter(); // from 'next/navigation'

  if (isLoading) return <HairProfileCardSkeleton />;
  if (error) return <ErrorState message="Failed to load profile" />;
  if (!profile) return <EmptyState message="No profile yet" />;

  return <HairProfileCard profile={profile} onEdit={() => router.push('/profile/edit')} />;
}
```

## File Organization

```
apps/web/
├── app/
│   └── (routes)/
│       └── feature/
│           └── page.tsx        # Uses smart components
├── components/
│   └── feature/
│       ├── Component.tsx       # Presentational (Phase 1)
│       └── ComponentContainer.tsx  # Smart (Phase 3)
├── hooks/
│   └── useFeatureLogic.ts      # Custom business logic hooks
└── stores/
    └── featureStore.ts         # Zustand stores
```

## Custom Hooks

### Business Logic Hook

```typescript
// apps/web/hooks/useQuizFlow.ts
import { useState, useCallback } from 'react';
import { useCreateHairProfile } from '@/lib/api/hooks';
import type { HairType } from '@hair-product-scanner/shared';

type QuizStep = 'hair-type' | 'concerns' | 'goals' | 'complete';

export function useQuizFlow() {
  const [step, setStep] = useState<QuizStep>('hair-type');
  const [hairType, setHairType] = useState<HairType | null>(null);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const createProfile = useCreateHairProfile();

  const nextStep = useCallback(() => {
    const steps: QuizStep[] = ['hair-type', 'concerns', 'goals', 'complete'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  }, [step]);

  const submitQuiz = useCallback(async () => {
    if (!hairType) return;

    await createProfile.mutateAsync({
      hairType,
      concerns,
      goals,
    });
    setStep('complete');
  }, [hairType, concerns, goals, createProfile]);

  return {
    step,
    hairType,
    concerns,
    goals,
    setHairType,
    setConcerns,
    setGoals,
    nextStep,
    submitQuiz,
    isSubmitting: createProfile.isPending,
    error: createProfile.error,
  };
}
```

## Zustand Store

```typescript
// apps/web/stores/quizStore.ts
import { create } from 'zustand';
import type { HairType } from '@hair-product-scanner/shared';

type QuizState = {
  hairType: HairType | null;
  concerns: string[];
  goals: string[];
  setHairType: (type: HairType) => void;
  toggleConcern: (concern: string) => void;
  toggleGoal: (goal: string) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  hairType: null,
  concerns: [],
  goals: [],

  setHairType: (type) => set({ hairType: type }),

  toggleConcern: (concern) =>
    set((state) => ({
      concerns: state.concerns.includes(concern) ? state.concerns.filter((c) => c !== concern) : [...state.concerns, concern],
    })),

  toggleGoal: (goal) =>
    set((state) => ({
      goals: state.goals.includes(goal) ? state.goals.filter((g) => g !== goal) : [...state.goals, goal],
    })),

  reset: () => set({ hairType: null, concerns: [], goals: [] }),
}));
```

## React Hook Form + Zod

```tsx
// apps/web/components/profile/ProfileForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHairProfileRequestSchema } from '@hair-product-scanner/shared';
import type { CreateHairProfileRequest } from '@hair-product-scanner/shared';

type ProfileFormProps = {
  onSubmit: (data: CreateHairProfileRequest) => Promise<void>;
  isSubmitting: boolean;
};

export function ProfileForm({ onSubmit, isSubmitting }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHairProfileRequest>({
    resolver: zodResolver(createHairProfileRequestSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Hair Type</label>
        <select {...register('hairType')} className="mt-1 block w-full rounded-md border">
          <option value="">Select...</option>
          <option value="straight">Straight</option>
          <option value="wavy">Wavy</option>
          <option value="curly">Curly</option>
          <option value="coily">Coily</option>
        </select>
        {errors.hairType && <p className="text-red-500 text-sm">{errors.hairType.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50">
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
```

## Loading/Error/Empty States

```tsx
// apps/web/components/shared/LoadingState.tsx
export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      <span className="ml-3 text-gray-600">{message}</span>
    </div>
  );
}

// apps/web/components/shared/ErrorState.tsx
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-blue-600 underline">
          Try again
        </button>
      )}
    </div>
  );
}

// apps/web/components/shared/EmptyState.tsx
export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  );
}
```

## Smart Component Pattern

```tsx
// apps/web/components/quiz/QuizContainer.tsx
'use client';

import { useQuizFlow } from '@/hooks/useQuizFlow';
import { HairTypeSelector } from './HairTypeSelector';
import { ConcernsSelector } from './ConcernsSelector';
import { GoalsSelector } from './GoalsSelector';
import { QuizComplete } from './QuizComplete';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

export function QuizContainer() {
  const { step, hairType, concerns, goals, setHairType, setConcerns, setGoals, nextStep, submitQuiz, isSubmitting, error } = useQuizFlow();

  if (error) {
    return <ErrorState message="Something went wrong. Please try again." />;
  }

  switch (step) {
    case 'hair-type':
      return (
        <HairTypeSelector
          selected={hairType}
          onSelect={(type) => {
            setHairType(type);
            nextStep();
          }}
        />
      );
    case 'concerns':
      return (
        <ConcernsSelector
          selected={concerns}
          onToggle={(concern) => {
            setConcerns(concerns.includes(concern) ? concerns.filter((c) => c !== concern) : [...concerns, concern]);
          }}
          onNext={nextStep}
        />
      );
    case 'goals':
      return (
        <GoalsSelector
          selected={goals}
          onToggle={(goal) => {
            setGoals(goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal]);
          }}
          onSubmit={submitQuiz}
          isSubmitting={isSubmitting}
        />
      );
    case 'complete':
      return <QuizComplete />;
    default:
      return null;
  }
}
```

## Testing (After Implementation)

### Hook Tests

```typescript
// apps/web/hooks/useQuizFlow.spec.ts
import { renderHook, act } from '@testing-library/react';
import { useQuizFlow } from './useQuizFlow';

describe('useQuizFlow', () => {
  it('starts at hair-type step', () => {
    const { result } = renderHook(() => useQuizFlow());
    expect(result.current.step).toBe('hair-type');
  });

  it('advances to next step', () => {
    const { result } = renderHook(() => useQuizFlow());

    act(() => {
      result.current.setHairType('curly');
      result.current.nextStep();
    });

    expect(result.current.step).toBe('concerns');
  });
});
```

### Store Tests

```typescript
// apps/web/stores/quizStore.spec.ts
import { useQuizStore } from './quizStore';

describe('quizStore', () => {
  beforeEach(() => {
    useQuizStore.getState().reset();
  });

  it('toggles concerns', () => {
    const { toggleConcern } = useQuizStore.getState();

    toggleConcern('frizz');
    expect(useQuizStore.getState().concerns).toContain('frizz');

    toggleConcern('frizz');
    expect(useQuizStore.getState().concerns).not.toContain('frizz');
  });
});
```

### Navigation Tests (Next.js)

Mock `next/navigation` to test navigation behavior:

```tsx
// apps/web/components/quiz/QuizComplete.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { QuizComplete } from './QuizComplete';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

describe('QuizComplete', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to scanner when "Start Scanning" is clicked', () => {
    render(<QuizComplete />);

    fireEvent.click(screen.getByText('Start Scanning'));

    expect(mockPush).toHaveBeenCalledWith('/scanner');
  });

  it('navigates to profile when "Edit Profile" is clicked', () => {
    render(<QuizComplete />);

    fireEvent.click(screen.getByText('Edit Profile'));

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });
});
```

### Smart Component Navigation Test

```tsx
// apps/web/components/profile/HairProfileCardContainer.spec.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HairProfileCardContainer } from './HairProfileCardContainer';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api/hooks', () => ({
  useHairProfile: vi.fn(),
}));

import { useHairProfile } from '@/lib/api/hooks';

describe('HairProfileCardContainer', () => {
  const mockPush = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to edit page when edit button clicked', async () => {
    vi.mocked(useHairProfile).mockReturnValue({
      data: { id: '1', hairType: 'curly', concerns: [], goals: [], createdAt: '' },
      isLoading: false,
      error: null,
    } as any);

    render(<HairProfileCardContainer />, { wrapper });

    fireEvent.click(screen.getByText('Edit'));

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });
});
```

## Completion Checklist

- [ ] Smart container components created
- [ ] Custom hooks implemented
- [ ] Zustand stores set up (if needed)
- [ ] Forms use React Hook Form + Zod
- [ ] Loading/error/empty states handled
- [ ] Tests written for hooks and stores
- [ ] `pnpm check-all` passes
