'use client';

import Link from 'next/link';

import { Button, Input } from '@hair-product-scanner/ui';
import { useSignupForm } from '@/web/hooks/use-signup-form';

import { FormField } from './form-field';
import { PasswordInput } from './password-input';
import { TermsCheckbox } from './terms-checkbox';

export function SignupForm() {
  const { form, onSubmit, isDisabled, errors } = useSignupForm();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {errors.root ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      ) : null}
      <FormField
        id="displayName"
        label={
          <>
            Display Name{' '}
            <span className="text-muted-foreground">(Optional)</span>
          </>
        }
        error={errors.displayName?.message}
      >
        <Input
          id="displayName"
          placeholder="Enter your display name"
          autoComplete="name"
          disabled={isDisabled}
          {...form.register('displayName')}
        />
      </FormField>
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isDisabled}
          {...form.register('email')}
        />
      </FormField>
      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
      >
        <PasswordInput
          id="password"
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={isDisabled}
          {...form.register('password')}
        />
      </FormField>
      <FormField
        id="confirmPassword"
        label="Confirm Password"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          disabled={isDisabled}
          {...form.register('confirmPassword')}
        />
      </FormField>
      <TermsCheckbox
        control={form.control}
        disabled={isDisabled}
        error={errors.acceptedTerms?.message}
      />
      <Button type="submit" disabled={isDisabled} className="w-full" size="lg">
        {isDisabled ? 'Creating account...' : 'Create Account'}
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
