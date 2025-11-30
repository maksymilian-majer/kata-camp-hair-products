'use client';

import { Button, toast, Toaster } from '@hair-product-scanner/ui';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Hair Product Scanner</h1>
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
