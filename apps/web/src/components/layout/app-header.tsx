'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@hair-product-scanner/ui';
import { useLogout } from '@/web/hooks';
import { useAuthStore } from '@/web/stores';

export function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const logoutMutation = useLogout();

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
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/hairminator-icon.svg"
            alt="Hairminator"
            width={32}
            height={32}
          />
          <span className="text-lg font-semibold">Hairminator</span>
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.displayName || user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
