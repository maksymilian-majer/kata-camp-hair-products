'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

async function enableMocking() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'development') return;

  const { worker } = await import('../mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mockingEnabled, setMockingEnabled] = useState(
    process.env.NODE_ENV !== 'development'
  );

  useEffect(() => {
    enableMocking().then(() => setMockingEnabled(true));
  }, []);

  if (!mockingEnabled) return null;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
