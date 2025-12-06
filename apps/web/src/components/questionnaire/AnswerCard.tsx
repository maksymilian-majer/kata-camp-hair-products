'use client';

import Image from 'next/image';

import { cn } from '@hair-product-scanner/ui';

type AnswerCardProps = {
  value: string;
  label: string;
  iconPath: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
};

export function AnswerCard({
  value,
  label,
  iconPath,
  isSelected,
  onSelect,
}: AnswerCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all',
        'bg-white dark:bg-slate-800',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm dark:bg-primary/10'
          : 'border-gray-200 dark:border-slate-700'
      )}
      aria-pressed={isSelected}
    >
      <div className="relative h-16 w-16 sm:h-20 sm:w-20">
        <Image
          src={iconPath}
          alt=""
          fill
          className="object-contain"
          sizes="(max-width: 640px) 64px, 80px"
        />
      </div>
      <span
        className={cn(
          'text-pretty text-center text-sm font-medium',
          isSelected ? 'text-primary' : 'text-gray-700 dark:text-slate-300'
        )}
      >
        {label}
      </span>
    </button>
  );
}
