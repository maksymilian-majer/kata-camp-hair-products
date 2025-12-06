'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import {
  cn,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@hair-product-scanner/ui';

export type NavItemData = {
  title: string;
  icon: LucideIcon;
  href: string;
  disabled: boolean;
};

type SidebarNavItemsProps = {
  items: NavItemData[];
};

export function SidebarNavItems({ items }: SidebarNavItemsProps) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.disabled) {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                disabled
                aria-disabled="true"
                aria-label={`${item.title}, disabled`}
                className="opacity-40 cursor-not-allowed"
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-accent text-accent-foreground font-medium'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
