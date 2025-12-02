'use client';

import type { ReactNode } from 'react';

import { SidebarProvider } from '@hair-product-scanner/ui';

import { AppSidebar, type AppSidebarProps } from './app-sidebar';
import { MobileBottomNav } from './mobile-bottom-nav';

export type AppLayoutProps = {
  children: ReactNode;
  user?: AppSidebarProps['user'];
  onLogout?: () => void;
  isLoggingOut?: boolean;
};

export function AppLayout({
  children,
  user,
  onLogout,
  isLoggingOut,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      <MobileBottomNav
        user={user}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
      />
    </SidebarProvider>
  );
}
