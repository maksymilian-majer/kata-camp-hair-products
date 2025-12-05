import type { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@hair-product-scanner/ui';

type QuestionCardProps = {
  number: number;
  title: string;
  description: string;
  children: ReactNode;
  error?: string;
};

export function QuestionCard({
  number,
  title,
  description,
  children,
  error,
}: QuestionCardProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">
          {number}. {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {children}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
