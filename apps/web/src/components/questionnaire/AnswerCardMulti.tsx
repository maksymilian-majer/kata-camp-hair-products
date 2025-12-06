'use client';

import Image from 'next/image';
import { CheckIcon } from 'lucide-react';

import { cn } from '@hair-product-scanner/ui';

type AnswerCardMultiProps = {
  value: string;
  label: string;
  iconPath: string;
  isSelected: boolean;
  onToggle: (value: string, selected: boolean) => void;
};

export function AnswerCardMulti({
  value,
  label,
  iconPath,
  isSelected,
  onToggle,
}: AnswerCardMultiProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value, !isSelected)}
      className={cn(
        'relative flex flex-col items-center gap-3 rounded-xl border-2 bg-white p-4 transition-all',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200'
      )}
      aria-pressed={isSelected}
    >
      {isSelected ? (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
          <CheckIcon className="h-3 w-3" />
        </div>
      ) : null}
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
          isSelected ? 'text-primary' : 'text-gray-700'
        )}
      >
        {label}
      </span>
    </button>
  );
}
