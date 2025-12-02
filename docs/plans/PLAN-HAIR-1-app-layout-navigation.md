# Implementation Plan: Mobile-First App Layout with Responsive Navigation

**Story**: HAIR-1
**Created**: 2025-12-02

## Overview

Implement a responsive navigation layout for the Hairminator app with:

- Bottom tab navigation on mobile (< 768px)
- Sidebar navigation on desktop/tablet (>= 768px)
- Three navigation items: Home, Questionnaire (disabled), Scan (disabled)
- Auth-based routing: redirect to `/login` when not authenticated, `/dashboard` when authenticated
- Delete the existing `/` route and use `/dashboard` as the main authenticated landing page

This plan covers **frontend phases only** (Phase 1-3) since no new backend functionality is required.

**Reference Implementation**: `/Users/maksymilian/kata-camp/hair-health-hub` (patterns adapted from Vite+React to Next.js App Router)

## BDD Scenarios to Implement

```gherkin
Scenario: User views app on mobile device
Given I am viewing the app on a device with screen width less than 768px
When the page loads
Then I should see a bottom navigation bar with 3 tabs
And the tabs should be "Home", "Questionnaire", and "Scan"
And each tab should display an icon and label
And the "Home" tab should appear selected/active
And the "Questionnaire" and "Scan" tabs should appear grayed out

Scenario: User views app on desktop/tablet
Given I am viewing the app on a device with screen width 768px or greater
When the page loads
Then I should see a sidebar navigation on the left
And the sidebar should contain "Home", "Questionnaire", and "Scan" items
And each item should display an icon and label
And the "Home" item should appear selected/active
And the "Questionnaire" and "Scan" items should appear grayed out

Scenario: User taps Home tab on mobile
Given I am on the mobile layout
When I tap the "Home" tab
Then I should see the Home page content
And the "Home" tab should be highlighted as active

Scenario: User attempts to tap disabled tab on mobile
Given I am on the mobile layout
When I tap the "Questionnaire" tab
Then nothing should happen
And I should remain on the current page
And the "Questionnaire" tab should remain grayed out

Scenario: Home page displays placeholder content
Given I am on the Home page
When the page loads
Then I should see a placeholder indicating scan history will appear here
And the placeholder should include text like "Your scan history will appear here"

Scenario: Unauthenticated user visits root
Given I am not authenticated
When I visit the root URL "/"
Then I should be redirected to "/login"

Scenario: Authenticated user visits root
Given I am authenticated
When I visit the root URL "/"
Then I should be redirected to "/dashboard"
```

---

## Phase 1: Presentational UI Components

**Subagent**: `frontend-phase-1`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Delete existing `/` route (`apps/web/src/app/page.tsx`)
- [ ] Create root redirect page (`apps/web/src/app/page.tsx`) that redirects to `/login` or `/dashboard` based on auth state
- [ ] Create `AppSidebar` component (`apps/web/src/components/layout/app-sidebar.tsx`)
  - Logo section at top
  - Navigation items: Home, Questionnaire (disabled), Scan (disabled)
  - User info + logout button at bottom
  - Uses Shadcn Sidebar components
- [ ] Create `MobileBottomNav` component (`apps/web/src/components/layout/mobile-bottom-nav.tsx`)
  - Fixed position bottom navigation bar
  - Three tabs: Home, Questionnaire (disabled), Scan (disabled)
  - Profile button that opens a sheet with user info + logout
  - Touch-friendly sizing (min 44px targets)
- [ ] Create `AppLayout` component (`apps/web/src/components/layout/app-layout.tsx`)
  - Wraps protected pages
  - Shows sidebar on desktop (hidden on mobile: `hidden md:block`)
  - Shows bottom nav on mobile (hidden on desktop: `md:hidden`)
  - Main content area with proper padding
- [ ] Create `NavItem` component (`apps/web/src/components/layout/nav-item.tsx`)
  - Reusable navigation item with icon, label, href, disabled state
  - Active state styling
  - Disabled state styling (grayed out, not clickable)
  - Keyboard accessible (focusable but not activatable when disabled)
- [ ] Update dashboard page (`apps/web/src/app/dashboard/page.tsx`)
  - Keep existing healthcheck functionality unchanged
  - Add placeholder content: "Your scan history will appear here"
- [ ] Update dashboard layout (`apps/web/src/app/dashboard/layout.tsx`)
  - Replace `AppHeader` with new `AppLayout`
  - Keep `ProtectedRoute` wrapper
- [ ] Export new components from `apps/web/src/components/layout/index.ts`

### Component Props Interfaces

```typescript
// NavItem props
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  disabled?: boolean;
  active?: boolean;
}

// AppLayout props
interface AppLayoutProps {
  children: React.ReactNode;
}
```

### Test Scenarios

After implementation, write tests that verify:

- [ ] `AppSidebar` renders logo, navigation items, and user section
- [ ] `AppSidebar` shows disabled items with reduced opacity
- [ ] `MobileBottomNav` renders all three tabs with icons and labels
- [ ] `MobileBottomNav` disabled tabs are not clickable
- [ ] `NavItem` renders active state correctly
- [ ] `NavItem` renders disabled state correctly
- [ ] `AppLayout` conditionally renders sidebar or bottom nav based on viewport

### Completion Criteria

- [ ] All components created and styled
- [ ] Props interfaces defined
- [ ] Root route redirects based on auth state
- [ ] Dashboard page shows placeholder + healthcheck
- [ ] Components viewable at `/dashboard`
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 2: API Client + Mocks

**Subagent**: `frontend-phase-2`
**Testing**: Write tests AFTER implementation

### Tasks

This phase is **minimal** since auth API already exists. Only need to ensure:

- [ ] Verify existing auth hooks work with new layout (`useAuthStore`, `useLogout`)
- [ ] No new API endpoints needed for navigation

### Test Scenarios

After implementation, write tests that verify:

- [ ] `useAuthStore` returns user and authentication state
- [ ] `useLogout` mutation clears auth and redirects

### Completion Criteria

- [ ] Existing auth hooks verified working
- [ ] MSW mocks return expected data
- [ ] Tests pass: `pnpm nx test web`

---

## Phase 3: Smart Components + Integration

**Subagent**: `frontend-phase-3`
**Testing**: Write tests AFTER implementation

### Tasks

- [ ] Wire up `AppSidebar` to auth store
  - Display user info from `useAuthStore`
  - Wire logout button to `useLogout` mutation
- [ ] Wire up `MobileBottomNav` to auth store
  - Display user info in profile sheet
  - Wire logout button to `useLogout` mutation
- [ ] Implement active state detection for `NavItem`
  - Use Next.js `usePathname` to determine active route
- [ ] Implement root redirect logic (`apps/web/src/app/page.tsx`)
  - Check `isAuthenticated` from auth store
  - Redirect to `/login` if not authenticated
  - Redirect to `/dashboard` if authenticated
  - Show loading spinner while auth initializes
- [ ] Add keyboard navigation support
  - All nav items focusable
  - Disabled items focusable but not activatable
  - Proper `aria-disabled` and `aria-current` attributes
- [ ] Add screen reader support
  - Announce disabled state: "Questionnaire, disabled"
  - Proper landmark roles (`nav`, `main`)

### Test Scenarios

After implementation, write integration tests that verify:

- [ ] User can navigate to Home page from sidebar
- [ ] User can navigate to Home page from bottom nav
- [ ] Disabled tabs do not navigate when clicked
- [ ] Logout button clears auth and redirects to `/login`
- [ ] Root URL redirects unauthenticated users to `/login`
- [ ] Root URL redirects authenticated users to `/dashboard`
- [ ] Layout switches from sidebar to bottom nav at 768px breakpoint
- [ ] Keyboard navigation works (Tab through items, Enter to activate)
- [ ] Screen reader announces disabled state correctly

### Completion Criteria

- [ ] Feature works end-to-end with real auth
- [ ] Navigation functions correctly
- [ ] Auth-based routing works
- [ ] Keyboard and screen reader accessible
- [ ] Tests pass: `pnpm nx test web`

---

## Phases 4-6: Backend (SKIPPED)

**Reason**: No new backend functionality required. Auth endpoints already exist.

---

## Phase 7: Integration (SKIPPED)

**Reason**: Frontend already connected to real backend via existing auth integration. No MSW mocks need to be removed for this feature.

---

## File Changes Summary

### Files to Delete

- None (but content of `apps/web/src/app/page.tsx` will be replaced)

### Files to Create

- `apps/web/src/components/layout/app-sidebar.tsx`
- `apps/web/src/components/layout/mobile-bottom-nav.tsx`
- `apps/web/src/components/layout/app-layout.tsx`
- `apps/web/src/components/layout/nav-item.tsx`
- Tests for each new component

### Files to Modify

- `apps/web/src/app/page.tsx` - Replace with auth-based redirect
- `apps/web/src/app/dashboard/page.tsx` - Add placeholder content (keep healthcheck)
- `apps/web/src/app/dashboard/layout.tsx` - Use new AppLayout
- `apps/web/src/components/layout/index.ts` - Export new components

### Files Unchanged

- `apps/web/src/components/layout/app-header.tsx` - Can be deleted or kept for reference
- All auth components - Already working
- All API/hooks - Already working

---

## Reference Patterns from hair-health-hub

### AppSidebar Pattern

```tsx
// Adapted for Next.js App Router
const navItems = [
  { title: 'Home', icon: Home, href: '/dashboard', disabled: false },
  { title: 'Questionnaire', icon: ClipboardList, href: '/questionnaire', disabled: true },
  { title: 'Scan', icon: Camera, href: '/scan', disabled: true },
];
```

### MobileBottomNav Pattern

```tsx
// Fixed bottom bar with Sheet for profile menu
<nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background md:hidden">{/* Tab buttons */}</nav>
```

### AppLayout Pattern

```tsx
// Responsive layout wrapper
<SidebarProvider>
  <div className="flex min-h-screen w-full">
    <div className="hidden md:block">
      <AppSidebar />
    </div>
    <main className="flex-1 pb-16 md:pb-0">{children}</main>
    <MobileBottomNav />
  </div>
</SidebarProvider>
```

---

## After Plan Completion

- Use `/implement Phase 1` to implement presentational components
- Use `/implement Phase 2` to verify auth hooks
- Use `/implement Phase 3` to wire up smart components and integration
- Use `/commit` after each phase
- Use `/pr` to create pull request when done
