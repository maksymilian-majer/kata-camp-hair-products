'use client';

import { Button, toast, Toaster } from '@hair-product-scanner/ui';
import { HealthBadge } from '@/web/components/health-badge';
import { useHealthCheck } from '@/web/hooks';

export default function Home() {
  const { data, isLoading } = useHealthCheck();

  const status = isLoading
    ? 'loading'
    : data?.status === 'ok'
      ? 'connected'
      : 'disconnected';

  return (
    <div className="min-h-screen flex items-center justify-center">
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
