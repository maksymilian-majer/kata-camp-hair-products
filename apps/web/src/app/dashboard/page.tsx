'use client';

import {
  Button,
  Card,
  CardContent,
  toast,
  Toaster,
} from '@hair-product-scanner/ui';
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
      <h1 className="text-2xl font-bold mb-6">
        Welcome{user?.displayName ? `, ${user.displayName}` : ''}!
      </h1>

      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your scan history will appear here
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg font-semibold">API Status</h2>
                <HealthBadge status={status} />
              </div>
              <p className="text-muted-foreground">
                Analyze hair product ingredients for your hair type
              </p>
              <Button onClick={() => toast.success('shadcn/ui is working!')}>
                Test Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
