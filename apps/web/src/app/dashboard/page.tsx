'use client';

import { Button, toast, Toaster } from '@hair-product-scanner/ui';
import { HealthBadge } from '@/web/components';
import { useHealthCheck } from '@/web/hooks';
import { useAuthStore } from '@/web/stores';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useHealthCheck();

  const status = isLoading
    ? 'loading'
    : data?.status === 'ok'
      ? 'connected'
      : 'disconnected';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">
        Welcome{user?.displayName ? `, ${user.displayName}` : ''}!
      </h1>
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-bold">Hairminator</h1>
          <HealthBadge status={status} />
        </div>
        <p className="text-muted-foreground">
          Analyze hair product ingredients for your hair type
        </p>
        <Button onClick={() => toast.success('shadcn/ui is working!')}>
          Test Toast
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
