'use client';

import Link from 'next/link';

import { Button, Input, Label } from '@hair-product-scanner/ui';

import { PasswordInput } from './password-input';

type LoginFormProps = {
  onSubmit?: (data: FormData) => void;
  disabled?: boolean;
  error?: string;
};

export function LoginForm({ onSubmit, disabled, error }: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(new FormData(e.currentTarget));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={disabled}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        Log In
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}
