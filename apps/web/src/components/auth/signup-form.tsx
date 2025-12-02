'use client';

import Link from 'next/link';

import { Button, Checkbox, Input, Label } from '@hair-product-scanner/ui';

import { PasswordInput } from './password-input';

type SignupFormProps = {
  onSubmit?: (data: FormData) => void;
  disabled?: boolean;
  error?: string;
};

export function SignupForm({ onSubmit, disabled, error }: SignupFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(new FormData(e.currentTarget));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">
          Display Name <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Enter your display name"
          autoComplete="name"
          disabled={disabled}
        />
      </div>

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
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={disabled}
          required
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox id="terms" name="terms" required disabled={disabled} />
        <Label htmlFor="terms" className="text-sm font-normal leading-tight">
          I accept the{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms and Conditions
          </Link>
        </Label>
      </div>

      <Button
        type="submit"
        disabled={disabled}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        Create Account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </p>
    </form>
  );
}
