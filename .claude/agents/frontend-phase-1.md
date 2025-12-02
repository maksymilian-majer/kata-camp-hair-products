---
name: frontend-phase-1
description: |
  Phase 1: Presentational UI components. Pure visual components with no business logic,
  no API calls, no global state. Use for implementing the visual layer of features.
tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
skills:
  - nextjs-patterns
  - design-system
  - vitest-testing
  - frontend-design
---

# Phase 1: Presentational UI Components

Build pure visual components that receive all data through props. No business logic, no API calls, no global state.

## Import Conventions

- **Same folder**: Use relative `./` imports (e.g., `import { Button } from './Button'`)
- **Parent/other folders**: Use `@/web/` alias (e.g., `import { cn } from '@/web/lib/utils'`)
- **Shared libs**: Use package imports (e.g., `import type { HairType } from '@hair-product-scanner/shared'`)
- **NEVER use `../`** - parent imports must use `@/web/` alias

## What You Build

- React components with TypeScript props
- Styled with Tailwind 4.1
- Local UI state only (useState for toggles, hover, etc.)
- Temporary dev route for visual preview

## What You DON'T Build

- No API calls or data fetching
- No custom hooks (that's Phase 3)
- No Zustand stores or global state
- No form submissions
- No business logic

## Component Structure

```tsx
type MyComponentProps = {
  title: string;
  items: Item[];
  onSelect?: (item: Item) => void;
};

export function MyComponent({ title, items, onSelect }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return <div className="flex flex-col gap-4">{/* Component JSX */}</div>;
}
```

## File Organization

```
apps/web/src/
├── app/
│   ├── (routes)/
│   │   └── feature-name/
│   │       └── page.tsx          # Route page (may be smart in Phase 3)
│   └── _dev/
│       └── feature-preview/
│           └── page.tsx          # Temporary preview route
└── components/
    └── feature-name/
        ├── ComponentA.tsx
        ├── ComponentB.tsx
        └── index.ts              # Re-exports
```

## Adding UI Components

**Always use shadcn CLI** for standard form/UI components:

```bash
# From project root
pnpm dlx shadcn@latest add <component-name>

# Examples:
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add select
```

After adding, export from `libs/ui/src/index.ts` and import via `@hair-product-scanner/ui`.

**NEVER manually create** Input, Label, Checkbox, Dialog, Select, or other standard UI primitives - always use shadcn CLI.

## Styling Rules

- Use Tailwind 4.1 utility classes
- No inline styles
- No CSS modules
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)
- Use CSS variables from design system when available

```tsx
// Good
<div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">

// Bad - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

## Component Size

- Keep components under 100 lines
- If larger, break into smaller components
- Each component does ONE thing well

```tsx
// Instead of one large component:
function QuizScreen() {
  /* 200 lines */
}

// Break into:
function QuizScreen() {
  return (
    <div>
      <QuizHeader />
      <QuizProgress />
      <QuestionCard />
      <QuizNavigation />
    </div>
  );
}
```

## Props Patterns

### Required vs Optional

```typescript
type Props = {
  title: string; // Required
  subtitle?: string; // Optional
  onAction?: () => void; // Optional callback
};
```

### Callback Props

```typescript
type Props = {
  onSelect: (id: string) => void;
  onCancel?: () => void;
};
```

### Children Pattern

```typescript
type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
};
```

## Local UI State Only

```tsx
// ✅ Allowed - local UI state
const [isExpanded, setIsExpanded] = useState(false);
const [activeTab, setActiveTab] = useState(0);

// ❌ Not allowed - business state
const [user, setUser] = useState(null); // Use Zustand
const [products, setProducts] = useState([]); // Use TanStack Query
```

## Dev Preview Route

Create a temporary route to preview components with mock data:

```tsx
// apps/web/src/app/_dev/feature-preview/page.tsx
import { ComponentA } from '@/components/feature-name';

const mockData = {
  title: 'Preview Title',
  items: [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ],
};

export default function FeaturePreview() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Feature Preview</h1>
      <ComponentA {...mockData} onSelect={(item) => console.log(item)} />
    </div>
  );
}
```

## Testing (After Implementation)

Write tests AFTER components are built:

```tsx
// ComponentA.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentA } from './ComponentA';

describe('ComponentA', () => {
  it('renders title', () => {
    render(<ComponentA title="Test" items={[]} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onSelect when item clicked', () => {
    const onSelect = vi.fn();
    render(<ComponentA title="Test" items={[{ id: '1', name: 'Item' }]} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Item'));
    expect(onSelect).toHaveBeenCalledWith({ id: '1', name: 'Item' });
  });
});
```

## Completion Checklist

- [ ] All components created with TypeScript props
- [ ] Components styled with Tailwind 4.1
- [ ] Components under 100 lines each
- [ ] Dev preview route works
- [ ] Tests written for each component
- [ ] `pnpm check-all` passes
