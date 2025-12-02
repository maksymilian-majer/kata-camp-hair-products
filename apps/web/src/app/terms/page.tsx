import Link from 'next/link';

import { Button } from '@hair-product-scanner/ui';

export const metadata = {
  title: 'Terms and Conditions - Hairminator',
  description: 'Hairminator terms and conditions',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>

        <div className="prose prose-sm text-muted-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Hairminator, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily use Hairminator for personal,
              non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              3. Disclaimer
            </h2>
            <p>
              The materials on Hairminator are provided on an as is basis.
              Hairminator makes no warranties, expressed or implied, and hereby
              disclaims and negates all other warranties including, without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              4. Limitations
            </h2>
            <p>
              In no event shall Hairminator or its suppliers be liable for any
              damages arising out of the use or inability to use the materials
              on Hairminator.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              5. Privacy
            </h2>
            <p>
              Your privacy is important to us. We will never share your personal
              information with third parties without your explicit consent.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Button asChild variant="outline">
            <Link href="/signup">Back to Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
