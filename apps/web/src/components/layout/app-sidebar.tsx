'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, ClipboardList, Home, LogOut, User } from 'lucide-react';

import {
  Button,
  cn,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@hair-product-scanner/ui';

const navItems = [
  { title: 'Home', icon: Home, href: '/dashboard', disabled: false },
  {
    title: 'Questionnaire',
    icon: ClipboardList,
    href: '/questionnaire',
    disabled: true,
  },
  { title: 'Scan', icon: Camera, href: '/scan', disabled: true },
];

export type AppSidebarProps = {
  user?: { displayName?: string | null; email: string } | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

export function AppSidebar({
  user,
  onLogout,
  isLoggingOut = false,
}: AppSidebarProps) {
  const pathname = usePathname();

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
            <SidebarMenu>
              {navItems.map((item) => {
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
                          isActive &&
                            'bg-accent text-accent-foreground font-medium'
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
