'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ClipboardList, Home, LogOut, User } from 'lucide-react';

import {
  Button,
  cn,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@hair-product-scanner/ui';

import { ThemeToggle } from './theme-toggle';

type NavItem = {
  title: string;
  icon: typeof Home;
  href: string;
  disabled: boolean;
};

const navButtonClass = cn(
  'flex min-w-[44px] flex-col items-center justify-center gap-1 px-3 py-2',
  'text-muted-foreground transition-colors hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md'
);

export type MobileBottomNavProps = {
  user?: { displayName?: string | null; email: string } | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  hasProfile?: boolean;
};

export function MobileBottomNav({
  user,
  onLogout,
  isLoggingOut = false,
  hasProfile = false,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navItems: NavItem[] = [
    { title: 'Home', icon: Home, href: '/dashboard', disabled: false },
    {
      title: 'Questionnaire',
      icon: ClipboardList,
      href: '/dashboard/questionnaire',
      disabled: false,
    },
    { title: 'Scan', icon: Camera, href: '/scan', disabled: !hasProfile },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.disabled) {
            return (
              <button
                key={item.title}
                disabled
                aria-disabled="true"
                aria-label={`${item.title}, disabled`}
                className="flex min-w-[44px] flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground/40 cursor-not-allowed"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(navButtonClass, isActive && 'text-primary')}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button className={navButtonClass}>
              <User className="h-5 w-5" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Profile</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {user?.displayName ?? 'User'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <ThemeToggle />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setIsSheetOpen(false);
                  onLogout?.();
                }}
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
