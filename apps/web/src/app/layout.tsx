import type { Metadata } from 'next';

import { Providers } from '@/web/components';

import '@hair-product-scanner/ui/styles/globals.css';

export const metadata: Metadata = {
  title: 'Hair Product Scanner',
  description: 'Analyze hair product ingredients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
