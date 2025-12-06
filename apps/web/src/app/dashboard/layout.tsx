'use client';

import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '@/web/components/auth';
import { AppLayout } from '@/web/components/layout';
import { useLogout, useQuestionnaire } from '@/web/hooks';
import { useAuthStore } from '@/web/stores';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout();
  const { data: profile } = useQuestionnaire();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout
        user={user}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
        hasProfile={!!profile}
      >
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}
