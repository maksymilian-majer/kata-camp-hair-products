import { Providers } from '../components/providers';

import '@hair-product-scanner/ui/styles/globals.css';

export const metadata = {
  title: 'Hair Product Scanner',
  description: 'Analyze hair product ingredients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
