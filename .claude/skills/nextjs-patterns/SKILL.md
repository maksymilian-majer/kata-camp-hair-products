# Next.js 16 App Router Patterns

Patterns for Next.js 16 with App Router, TypeScript, and Tailwind 4.1.

## TypeScript Guidelines

### Type Usage

- Use TypeScript for all code; prefer `type` over `interface`
- Use explicit return types for all functions
- Avoid `any` at all costs
- Use absolute imports with `@/...` paths

```typescript
// Good
type UserProps = {
  id: string;
  name: string;
  email?: string;
};

// Avoid
interface UserProps {
  id: string;
}
```

### Code Style

- Functional and declarative programming patterns
- Avoid classes, use functions
- Descriptive variable names with auxiliary verbs (`isLoading`, `hasError`)
- Use `function` keyword for pure functions
- Use declarative JSX

## File Extensions and Naming

### Extension Rules

Use `.tsx` ONLY for files containing JSX. Use `.ts` for everything else.

**Use `.ts` for:**

- `index.ts` - Barrel exports
- API services (`*.ts`)
- Schemas (`*.schema.ts`)
- Types (`types/*.ts`)
- Hooks without JSX
- Utilities

**Use `.tsx` for:**

- React components
- Pages and layouts (`app/**/*.tsx`)
- Tests (`*.spec.tsx`)
- Hooks that return JSX (rare)

### File Naming by Location

```
apps/web/
├── app/                          # kebab-case for routes
│   ├── (routes)/
│   │   └── quiz/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   └── _dev/                     # Dev preview routes
│       └── preview/
│           └── page.tsx
├── components/                   # PascalCase for components
│   └── quiz/
│       ├── QuizCard.tsx
│       ├── QuizProgress.tsx
│       └── index.ts
├── hooks/                        # camelCase starting with 'use'
│   └── useQuiz.ts
├── lib/                          # camelCase for utilities
│   └── apiClient.ts
└── types/                        # camelCase for type files
    └── quiz.ts
```

### Index Files

- Use `index.ts` for barrel exports only
- Do not write code in index files
- Favor named exports

```typescript
// components/quiz/index.ts
export { QuizCard } from './QuizCard';
export { QuizProgress } from './QuizProgress';
export type { QuizCardProps } from './QuizCard';
```

## React Component Patterns

### Smart vs Presentational Components

**Presentational Components**: Pure UI, receive props, no hooks, no side effects.
**Smart Components**: Handle logic, hooks, state, pass props to presentational.

```tsx
// Presentational - no hooks, pure rendering
type QuizCardDisplayProps = {
  question: string;
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  isSubmitting: boolean;
};

function QuizCardDisplay({ question, options, selectedOption, onSelect, isSubmitting }: QuizCardDisplayProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{question}</h2>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button key={option} onClick={() => onSelect(option)} disabled={isSubmitting} className={cn('p-4 rounded-lg text-left transition-colors', selectedOption === option ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200')}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Smart - handles state and logic
export function QuizCard() {
  const { currentQuestion, submitAnswer, isSubmitting } = useQuiz();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    setSelected(option);
  };

  const handleSubmit = () => {
    if (selected) {
      submitAnswer(selected);
      setSelected(null);
    }
  };

  return <QuizCardDisplay question={currentQuestion.text} options={currentQuestion.options} selectedOption={selected} onSelect={handleSelect} isSubmitting={isSubmitting} />;
}
```

### Component Size Limit

Keep components under 100 lines. Break larger components into smaller pieces.

```tsx
// Instead of one large component
function QuizScreen() {
  /* 200 lines - BAD */
}

// Break into focused components
function QuizScreen() {
  return (
    <div className="min-h-screen bg-gray-50">
      <QuizHeader />
      <QuizProgress />
      <QuizCard />
      <QuizNavigation />
    </div>
  );
}
```

## App Router Structure

### Server vs Client Components

Server Components are default. Add `'use client'` only when needed:

- Using hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs

```tsx
// Server Component (default) - no directive needed
export default function QuizPage() {
  return (
    <main>
      <QuizHeader />
      <QuizContent /> {/* This can be client */}
    </main>
  );
}

// Client Component - needs directive
('use client');

import { useState } from 'react';

export function QuizContent() {
  const [step, setStep] = useState(0);
  return <div onClick={() => setStep((s) => s + 1)}>...</div>;
}
```

### Route Organization

```
app/
├── layout.tsx              # Root layout (providers, metadata)
├── page.tsx                # Home page
├── (routes)/               # Route groups
│   ├── quiz/
│   │   ├── page.tsx        # /quiz
│   │   ├── layout.tsx      # Quiz-specific layout
│   │   └── [questionId]/
│   │       └── page.tsx    # /quiz/:questionId
│   └── scan/
│       └── page.tsx        # /scan
├── _dev/                   # Dev preview routes
│   └── preview/
│       └── page.tsx
└── api/                    # API routes (if needed)
```

## Form Patterns with React Hook Form + Zod

### Schema Definition

```typescript
// schemas/quiz.schema.ts
import { z } from 'zod';

export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOption: z.string().min(1, 'Please select an option'),
});

export type QuizAnswerFormData = z.infer<typeof quizAnswerSchema>;
```

### Form Component

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quizAnswerSchema, type QuizAnswerFormData } from '@/schemas/quiz.schema';

export function QuizForm({ questionId }: { questionId: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuizAnswerFormData>({
    resolver: zodResolver(quizAnswerSchema),
    defaultValues: {
      questionId,
      selectedOption: '',
    },
  });

  const onSubmit = async (data: QuizAnswerFormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('questionId')} />

      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input type="radio" value={option} {...register('selectedOption')} className="w-4 h-4" />
            {option}
          </label>
        ))}
      </div>

      {errors.selectedOption && <p className="text-red-500 text-sm">{errors.selectedOption.message}</p>}

      <button type="submit" disabled={isSubmitting} className="bg-primary-500 text-white px-4 py-2 rounded-lg disabled:opacity-50">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Tailwind 4.1 Styling

### Class Organization

```tsx
// Organize classes logically
<div
  className={cn(
    // Layout
    'flex flex-col gap-4',
    // Sizing
    'w-full max-w-md',
    // Spacing
    'p-6 m-4',
    // Visual
    'bg-white rounded-lg shadow-sm',
    // States
    'hover:shadow-md transition-shadow'
  )}
>
```

### Responsive Design (Mobile-First)

```tsx
<div
  className={cn(
    // Mobile (default)
    'flex flex-col gap-2 p-4',
    // Tablet
    'sm:flex-row sm:gap-4 sm:p-6',
    // Desktop
    'lg:gap-8 lg:p-8'
  )}
>
```

### Conditional Classes

Use `clsx` or `cn` utility for conditional classes:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<button
  className={cn(
    'px-4 py-2 rounded-lg transition-colors',
    isSelected
      ? 'bg-primary-500 text-white'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
```

### No Inline Styles

```tsx
// Good
<div className="flex flex-col gap-4 p-4 bg-white rounded-lg">

// Bad - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

## State Management

### Local UI State

```tsx
// Allowed - local UI state only
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState(0);
const [searchQuery, setSearchQuery] = useState('');
```

### Server State (TanStack Query)

```typescript
// hooks/useQuiz.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useQuiz(questionId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['quiz', questionId],
    queryFn: () => quizApi.getQuestion(questionId),
  });

  const submitMutation = useMutation({
    mutationFn: (answer: string) => quizApi.submitAnswer(questionId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
  });

  return {
    question: query.data,
    isLoading: query.isLoading,
    error: query.error,
    submitAnswer: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
  };
}
```

### Client State (Zustand)

```typescript
// stores/quizStore.ts
import { create } from 'zustand';

type QuizStore = {
  currentStep: number;
  answers: Record<string, string>;
  setCurrentStep: (step: number) => void;
  setAnswer: (questionId: string, answer: string) => void;
  reset: () => void;
};

export const useQuizStore = create<QuizStore>((set) => ({
  currentStep: 0,
  answers: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
  reset: () => set({ currentStep: 0, answers: {} }),
}));
```

## Best Practices

### Component Organization

1. Type definitions at top
2. Component implementation
3. Helper functions
4. Exports at bottom

### Error Boundaries

Wrap sections that might fail:

```tsx
// app/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <button onClick={reset} className="bg-primary-500 text-white px-4 py-2 rounded-lg">
        Try again
      </button>
    </div>
  );
}
```

### Loading States

```tsx
// app/quiz/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );
}
```
