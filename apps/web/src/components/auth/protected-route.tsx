'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/web/stores';

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallbackPath?: string;
};

export function ProtectedRoute({
  children,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace(fallbackPath);
    }
  }, [isInitialized, isAuthenticated, router, fallbackPath]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
