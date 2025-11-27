# Design System (Tailwind 4.1)

Patterns for Tailwind CSS 4.1 styling and component design. This is a placeholder skill - actual design system details will be added based on project-specific design.

## Additional Resources

For detailed UI component design guidance, use the `frontend-design` skill provided by the `frontend-design@claude-code-plugins` plugin.

To install: `/plugin install frontend-design@claude-code-plugins`

## Tailwind 4.1 CSS Usage

### Class Organization

Organize classes in a logical order:

```tsx
<div
  className={cn(
    // Layout
    'flex flex-col',
    // Sizing
    'w-full max-w-md h-auto',
    // Spacing
    'p-6 m-4 gap-4',
    // Visual
    'bg-white rounded-lg shadow-sm border border-gray-200',
    // Typography
    'text-base font-medium text-gray-900',
    // States
    'hover:shadow-md focus:ring-2 focus:ring-primary-500',
    // Transitions
    'transition-all duration-200',
  )}
>
```

### Responsive Design (Mobile-First)

Start with mobile styles, add breakpoints for larger screens:

```tsx
<div
  className={cn(
    // Mobile (default)
    'flex flex-col gap-4 p-4',
    // Tablet (640px+)
    'sm:flex-row sm:gap-6 sm:p-6',
    // Desktop (1024px+)
    'lg:gap-8 lg:p-8',
    // Large desktop (1280px+)
    'xl:max-w-7xl xl:mx-auto',
  )}
>
```

### Breakpoint Reference

| Prefix | Min Width | Usage            |
| ------ | --------- | ---------------- |
| (none) | 0px       | Mobile default   |
| `sm:`  | 640px     | Tablet portrait  |
| `md:`  | 768px     | Tablet landscape |
| `lg:`  | 1024px    | Desktop          |
| `xl:`  | 1280px    | Large desktop    |
| `2xl:` | 1536px    | Extra large      |

## Dark Mode Implementation

Follow shadcn/ui dark mode for Next.js: https://ui.shadcn.com/docs/dark-mode/next

### Setup with next-themes

```bash
pnpm add next-themes
```

### Theme Provider

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

### Root Layout

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Theme Toggle Component

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn('p-2 rounded-lg', 'bg-gray-100 dark:bg-gray-800', 'hover:bg-gray-200 dark:hover:bg-gray-700', 'transition-colors')}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
```

### Dark Mode Classes

Use `dark:` prefix for dark mode styles:

```tsx
<div
  className={cn(
    // Light mode
    'bg-white text-gray-900 border-gray-200',
    // Dark mode
    'dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700',
  )}
>
```

### CSS Variables for Colors

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### Using CSS Variables

```tsx
<div className="bg-background text-foreground border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">Primary Button</button>
</div>
```

## Component Styling Approach

### No Inline Styles

```tsx
// Good
<div className="flex flex-col gap-4 p-4 bg-white rounded-lg">

// Bad - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### No CSS Modules

```tsx
// Good - Tailwind classes
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg">

// Bad - CSS modules
import styles from './Button.module.css';
<button className={styles.button}>
```

### Conditional Classes with cn()

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
    'px-4 py-2 rounded-lg font-medium transition-colors',
    // Variant
    variant === 'primary' && 'bg-primary-500 text-white hover:bg-primary-600',
    variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    variant === 'ghost' && 'bg-transparent hover:bg-gray-100',
    // States
    disabled && 'opacity-50 cursor-not-allowed',
    // Custom classes
    className
  )}
  disabled={disabled}
>
  {children}
</button>
```

## Component Variants Pattern

Use a consistent pattern for component variants:

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  destructive: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  return (
    <button className={cn('inline-flex items-center justify-center rounded-lg font-medium', 'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:opacity-50 disabled:cursor-not-allowed', variantStyles[variant], sizeStyles[size], className)} {...props}>
      {children}
    </button>
  );
}
```

## Common Patterns

### Card Component

```tsx
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border', 'bg-white dark:bg-gray-900', 'border-gray-200 dark:border-gray-700', 'shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}
```

### Form Input

```tsx
export function Input({
  label,
  error,
  className,
  ...props
}: {
  label?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input className={cn('w-full px-3 py-2 rounded-lg border', 'bg-white dark:bg-gray-900', 'border-gray-300 dark:border-gray-600', 'text-gray-900 dark:text-gray-100', 'placeholder-gray-400 dark:placeholder-gray-500', 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent', 'disabled:opacity-50 disabled:cursor-not-allowed', error && 'border-red-500 focus:ring-red-500', className)} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

## Best Practices

### DO:

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming
- Use `cn()` for conditional classes
- Support dark mode with `dark:` prefix
- Keep component variants consistent

### DON'T:

- Use inline styles
- Use CSS modules
- Hardcode colors (use design tokens)
- Forget dark mode support
- Mix styling approaches
- Create overly specific utility classes
