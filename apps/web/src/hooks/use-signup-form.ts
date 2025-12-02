'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import type { SignupFormData } from '@hair-product-scanner/shared';
import { signupSchema } from '@hair-product-scanner/shared';
import { useSignup } from '@/web/hooks/use-auth';
import { AuthApiError } from '@/web/lib/api/auth';
import { useAuthStore } from '@/web/stores';

export function useSignupForm() {
  const router = useRouter();
  const signupMutation = useSignup();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { acceptedTerms: false as unknown as true },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await signupMutation.mutateAsync({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        acceptedTerms: data.acceptedTerms,
      });
      setAuth(response.accessToken, response.user);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AuthApiError && error.code === 'EMAIL_EXISTS') {
        form.setError('email', { message: error.message });
      } else if (error instanceof AuthApiError) {
        form.setError('root', { message: error.message });
      } else {
        form.setError('root', { message: 'An unexpected error occurred' });
      }
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: signupMutation.isPending,
    errors: form.formState.errors,
  };
}
