import { useQuery } from '@tanstack/react-query';

import type { HealthResponse } from '@hair-product-scanner/shared';

import { env } from '../app/env';

export function useHealthCheck() {
  return useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(`${env.BACKEND_URL}/api/health`);
      if (!res.ok) throw new Error('API unavailable');
      return res.json();
    },
    refetchInterval: 10000,
    retry: false,
  });
}
