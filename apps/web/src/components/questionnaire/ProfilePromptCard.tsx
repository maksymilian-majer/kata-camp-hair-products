import Link from 'next/link';
import { ClipboardListIcon } from 'lucide-react';

import { Button, Card, CardContent } from '@hair-product-scanner/ui';

type ProfilePromptCardProps = {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  note?: string;
};

export function ProfilePromptCard({
  title = 'Welcome to Hairminator',
  description = 'Complete your dermo-safety profile to get personalized product recommendations.',
  ctaText = 'Complete Your Profile',
  ctaHref = '/dashboard/questionnaire',
  note = "Once your profile is complete, you'll be able to scan products and get personalized ingredient analysis.",
}: ProfilePromptCardProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <ClipboardListIcon className="size-10 text-primary" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      <Button asChild size="lg">
        <Link href={ctaHref}>
          <ClipboardListIcon className="size-4" />
          {ctaText}
        </Link>
      </Button>

      <Card className="max-w-md bg-muted/50">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          {note}
        </CardContent>
      </Card>
    </div>
  );
}
