'use client';

import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import type { LoginFormData } from '@hair-product-scanner/shared';
import { loginSchema } from '@hair-product-scanner/shared';
import { Button, Input, Label } from '@hair-product-scanner/ui';
import { useLogin } from '@/web/hooks';
import { AuthApiError } from '@/web/lib/api/auth';
import { useAuthStore } from '@/web/stores';

import { PasswordInput } from './password-input';

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      setAuth(response.accessToken, response.user);
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof AuthApiError) {
        setError('root', { message: error.message });
      } else {
        setError('root', { message: 'An unexpected error occurred' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {errors.root ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          disabled={loginMutation.isPending}
          {...register('email')}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={loginMutation.isPending}
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-primary hover:bg-primary/90"
        size="lg"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Log In'}
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
