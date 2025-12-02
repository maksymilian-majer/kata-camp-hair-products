'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@hair-product-scanner/ui';

export type NavItemProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  disabled?: boolean;
  active?: boolean;
};

export function NavItem({
  icon: Icon,
  label,
  href,
  disabled = false,
  active = false,
}: NavItemProps) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={`${label}, disabled`}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2',
          'text-muted-foreground/40 cursor-not-allowed opacity-50'
        )}
        tabIndex={0}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2',
        'text-muted-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active && 'bg-accent text-accent-foreground font-medium'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
