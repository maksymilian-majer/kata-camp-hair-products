import Image from 'next/image';

import { Card, CardContent } from '@hair-product-scanner/ui';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-card">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm relative pt-8">
          <div className="absolute left-1/2 -translate-x-1/2 -top-0 z-10">
            <Image
              src="/hairminator-icon.svg"
              alt="Hairminator"
              width={64}
              height={64}
              priority
            />
          </div>
          <Card className="border-0 shadow-[0_40px_50px_rgba(0,0,0,0.1)]">
            <CardContent className="pt-12">{children}</CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden md:flex flex-1 relative">
        <Image
          src="/login-illustration.webp"
          alt="Hairminator illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
