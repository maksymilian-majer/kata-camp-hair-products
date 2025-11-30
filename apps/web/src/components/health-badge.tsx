import { Badge } from '@hair-product-scanner/ui';

interface HealthBadgeProps {
  status: 'loading' | 'connected' | 'disconnected';
}

export function HealthBadge({ status }: HealthBadgeProps) {
  const variants = {
    loading: { variant: 'secondary' as const, label: 'Checking...' },
    connected: { variant: 'default' as const, label: 'Connected' },
    disconnected: { variant: 'destructive' as const, label: 'Disconnected' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}
