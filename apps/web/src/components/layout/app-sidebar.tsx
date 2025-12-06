'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, ClipboardList, Home, LogOut, User } from 'lucide-react';

import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from '@hair-product-scanner/ui';

import type { NavItemData } from './sidebar-nav-items';
import { SidebarNavItems } from './sidebar-nav-items';
import { ThemeToggle } from './theme-toggle';

export type AppSidebarProps = {
  user?: { displayName?: string | null; email: string } | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
  hasProfile?: boolean;
};

function getNavItems(hasProfile: boolean): NavItemData[] {
  return [
    { title: 'Home', icon: Home, href: '/dashboard', disabled: false },
    {
      title: 'Questionnaire',
      icon: ClipboardList,
      href: '/dashboard/questionnaire',
      disabled: false,
    },
    { title: 'Scan', icon: Camera, href: '/scan', disabled: !hasProfile },
  ];
}

export function AppSidebar({
  user,
  onLogout,
  isLoggingOut = false,
  hasProfile = false,
}: AppSidebarProps) {
  const navItems = getNavItems(hasProfile);

  return (
    <Sidebar
      collapsible="none"
      className="hidden md:flex border-r h-screen sticky top-0"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-2">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/hairminator.svg"
                alt="Hairminator"
                width={160}
                height={24}
              />
            </Link>
          </div>
          <SidebarGroupContent>
            <SidebarNavItems items={navItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName || user?.email || 'User'}
              </p>
              {user?.displayName && user?.email ? (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
          <ThemeToggle />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Log Out'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
