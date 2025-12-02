# Vitest Testing Patterns

Patterns for Vitest testing including frontend (React Testing Library) and backend (NestJS) tests, plus MSW for API mocking.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { QuizCard } from './QuizCard'`)
- **Parent/other folders**: Use `@/web/` alias (e.g., `import { server } from '@/web/mocks/server'`)
- **Shared libs**: Use package imports (e.g., `import type { Quiz } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/web/` alias

## Test File Organization

### File Naming

- Test files: `*.spec.ts` or `*.spec.tsx`
- Mock files: `*.mock.ts`
- Test factories: `*.test-factory.ts`

### File Location

Place tests next to the code they test:

```
components/
├── QuizCard.tsx
├── QuizCard.spec.tsx       # Test file
└── quiz.mock.ts            # Mock data

services/
├── quiz.service.ts
├── quiz.service.spec.ts
└── quiz.test-factory.ts    # Test factory
```

## Frontend Testing (React Testing Library)

### Basic Component Test

```tsx
// QuizCard.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QuizCard } from './QuizCard';

describe('QuizCard', () => {
  const mockProps = {
    question: 'What is your hair type?',
    options: ['Straight', 'Wavy', 'Curly', 'Coily'],
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question text', () => {
    render(<QuizCard {...mockProps} />);
    expect(screen.getByText('What is your hair type?')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<QuizCard {...mockProps} />);
    mockProps.options.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('calls onSelect when option is clicked', () => {
    render(<QuizCard {...mockProps} />);
    fireEvent.click(screen.getByText('Curly'));
    expect(mockProps.onSelect).toHaveBeenCalledWith('Curly');
  });

  it('shows selected state for clicked option', () => {
    render(<QuizCard {...mockProps} selectedOption="Wavy" />);
    const wavyButton = screen.getByText('Wavy');
    expect(wavyButton).toHaveClass('bg-primary-500');
  });
});
```

### Testing Hooks

```tsx
// useQuiz.spec.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuiz } from './useQuiz';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches quiz data', async () => {
    const { result } = renderHook(() => useQuiz('quiz-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.quiz).toBeDefined();
    expect(result.current.quiz?.title).toBe('Hair Profile Quiz');
  });

  it('submits answer', async () => {
    const { result } = renderHook(() => useQuiz('quiz-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.submitAnswer('option-1');
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
```

### Testing with User Events

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { QuizForm } from './QuizForm';

describe('QuizForm', () => {
  it('submits form with selected values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<QuizForm onSubmit={onSubmit} />);

    // Select an option
    await user.click(screen.getByLabelText('Curly'));

    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      hairType: 'curly',
    });
  });
});
```

## Backend Testing (NestJS)

### Service Unit Tests

```typescript
// quiz.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QuizService } from './quiz.service';
import { QuizRepository } from './quiz.repository';
import { QuizNotFoundException } from './exceptions';

describe('QuizService', () => {
  let service: QuizService;
  let repository: QuizRepository;

  const mockRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: 'IQuizRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    repository = module.get('IQuizRepository');
  });

  describe('getQuiz', () => {
    it('returns quiz when found', async () => {
      const mockQuiz = { id: '1', title: 'Test Quiz' };
      mockRepository.findById.mockResolvedValue(mockQuiz);

      const result = await service.getQuiz('1');

      expect(result).toEqual(mockQuiz);
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });

    it('throws QuizNotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.getQuiz('999')).rejects.toThrow(QuizNotFoundException);
    });
  });

  describe('createQuiz', () => {
    it('creates quiz with valid data', async () => {
      const createDto = {
        title: 'New Quiz',
        questions: [{ text: 'Q1', options: ['A', 'B'] }],
      };
      const createdQuiz = { id: '1', ...createDto };
      mockRepository.create.mockResolvedValue(createdQuiz);

      const result = await service.createQuiz(createDto);

      expect(result).toEqual(createdQuiz);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('throws ValidationException when no questions', async () => {
      const createDto = { title: 'Empty Quiz', questions: [] };

      await expect(service.createQuiz(createDto)).rejects.toThrow('Quiz must have at least one question');
    });
  });
});
```

### Table-Driven Tests

```typescript
// eligibility.spec.ts
import { describe, it, expect } from 'vitest';
import { isEligible } from './eligibility';

describe('isEligible', () => {
  const testCases = [
    {
      name: 'user meets all requirements',
      hairProfile: { type: 'curly', porosity: 'high' },
      productRequirements: ['curly', 'high-porosity'],
      expected: true,
    },
    {
      name: 'user missing hair type requirement',
      hairProfile: { type: 'straight', porosity: 'high' },
      productRequirements: ['curly', 'high-porosity'],
      expected: false,
    },
    {
      name: 'product has no requirements',
      hairProfile: { type: 'wavy', porosity: 'low' },
      productRequirements: [],
      expected: true,
    },
    {
      name: 'user has extra features beyond requirements',
      hairProfile: { type: 'curly', porosity: 'high', concerns: ['frizz'] },
      productRequirements: ['curly'],
      expected: true,
    },
  ];

  testCases.forEach(({ name, hairProfile, productRequirements, expected }) => {
    it(name, () => {
      const result = isEligible(hairProfile, productRequirements);
      expect(result).toBe(expected);
    });
  });
});
```

## MSW (Mock Service Worker) Patterns

### Handler Setup

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // GET request
  http.get('/api/quiz/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      title: 'Hair Profile Quiz',
      questions: [{ id: 'q1', text: 'What is your hair type?', options: ['Straight', 'Wavy', 'Curly', 'Coily'] }],
    });
  }),

  // POST request
  http.post('/api/quiz/:id/answer', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      quizId: id,
      answerId: body.answerId,
    });
  }),

  // Error response
  http.get('/api/quiz/error', () => {
    return HttpResponse.json({ message: 'Quiz not found' }, { status: 404 });
  }),

  // Delay response
  http.get('/api/quiz/slow', async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return HttpResponse.json({ id: 'slow', title: 'Slow Quiz' });
  }),
];
```

### Server Setup

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Test Setup File

```typescript
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Using MSW in Tests

```tsx
// api.spec.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/web/mocks/server';
import { describe, it, expect } from 'vitest';
import { QuizPage } from './QuizPage';

describe('QuizPage', () => {
  it('displays quiz data from API', async () => {
    render(<QuizPage quizId="1" />);

    await waitFor(() => {
      expect(screen.getByText('Hair Profile Quiz')).toBeInTheDocument();
    });
  });

  it('handles API error', async () => {
    // Override handler for this test
    server.use(
      http.get('/api/quiz/:id', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    render(<QuizPage quizId="1" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    server.use(
      http.get('/api/quiz/:id', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ id: '1', title: 'Quiz' });
      })
    );

    render(<QuizPage quizId="1" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

## Mock Patterns

### vi.fn() for Functions

```typescript
const mockCallback = vi.fn();

// With implementation
const mockFetch = vi.fn().mockResolvedValue({ data: 'result' });

// With different returns
const mockService = vi.fn().mockResolvedValueOnce({ id: '1' }).mockResolvedValueOnce({ id: '2' }).mockRejectedValueOnce(new Error('Failed'));
```

### vi.mock() for Modules

```typescript
// Mock entire module
vi.mock('./api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock with factory
vi.mock('./quiz.service', () => {
  return {
    QuizService: vi.fn().mockImplementation(() => ({
      getQuiz: vi.fn().mockResolvedValue({ id: '1', title: 'Mock Quiz' }),
      submitAnswer: vi.fn().mockResolvedValue({ success: true }),
    })),
  };
});
```

### vi.spyOn() for Methods

```typescript
import * as quizModule from './quiz';

const spy = vi.spyOn(quizModule, 'calculateScore');
spy.mockReturnValue(85);

// Test code that uses calculateScore
expect(spy).toHaveBeenCalledWith(expect.any(Array));

spy.mockRestore(); // Restore original implementation
```

## Test Factories

```typescript
// quiz.test-factory.ts
import { Quiz, Question } from './types';

export function createMockQuiz(overrides?: Partial<Quiz>): Quiz {
  return {
    id: 'quiz-1',
    title: 'Test Quiz',
    questions: [createMockQuestion()],
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockQuestion(overrides?: Partial<Question>): Question {
  return {
    id: 'q-1',
    text: 'Test question?',
    options: ['Option A', 'Option B', 'Option C'],
    ...overrides,
  };
}

// Usage in tests
const quiz = createMockQuiz({ title: 'Custom Title' });
const question = createMockQuestion({ options: ['Yes', 'No'] });
```

## Coverage Requirements

Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '*.config.*', '**/*.d.ts', '**/*.test-factory.ts', '**/mocks/**'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

## Best Practices

### DO:

- Test behavior, not implementation
- Use descriptive test names
- Clear mocks between tests (`vi.clearAllMocks()`)
- Use test factories for complex objects
- Test error states and edge cases
- Use `waitFor` for async assertions

### DON'T:

- Test implementation details
- Test third-party libraries
- Share state between tests
- Use `sleep` instead of proper async handling
- Write tests for trivial code
- Forget to restore mocks

### Test Structure (AAA Pattern)

```typescript
it('should do something', async () => {
  // Arrange - setup test data and mocks
  const mockData = createMockQuiz();
  mockRepository.findById.mockResolvedValue(mockData);

  // Act - perform the action
  const result = await service.getQuiz('1');

  // Assert - verify the outcome
  expect(result).toEqual(mockData);
  expect(mockRepository.findById).toHaveBeenCalledWith('1');
});
```
