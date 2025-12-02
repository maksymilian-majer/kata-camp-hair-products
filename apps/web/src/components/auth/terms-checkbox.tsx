'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Link from 'next/link';

import type { SignupFormData } from '@hair-product-scanner/shared';
import { Checkbox, Label } from '@hair-product-scanner/ui';

type TermsCheckboxProps = {
  control: Control<SignupFormData>;
  disabled?: boolean;
  error?: string;
};

export function TermsCheckbox({
  control,
  disabled,
  error,
}: TermsCheckboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <Controller
          name="acceptedTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-tight">
          I accept the{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms and Conditions
          </Link>
        </Label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
