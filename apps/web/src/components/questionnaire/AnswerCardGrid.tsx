import type { ReactNode } from 'react';

type AnswerCardGridProps = {
  children: ReactNode;
};

export function AnswerCardGrid({ children }: AnswerCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
  );
}
