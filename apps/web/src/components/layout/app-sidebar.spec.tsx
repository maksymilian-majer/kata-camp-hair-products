import { describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from '@hair-product-scanner/ui';
import { render, screen, setup } from '@/web/testing/test-utils';

import { AppSidebar } from './app-sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

function setupWithProvider(ui: React.ReactElement) {
  return setup(<SidebarProvider>{ui}</SidebarProvider>);
}

describe('AppSidebar', () => {
  const mockUser = {
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  it('renders logo', () => {
    renderWithProvider(<AppSidebar user={mockUser} />);

    expect(screen.getByAltText('Hairminator')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithProvider(<AppSidebar user={mockUser} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Questionnaire')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
  });

  it('shows Scan disabled when hasProfile is false', () => {
    renderWithProvider(<AppSidebar user={mockUser} hasProfile={false} />);

    const scanButton = screen.getByText('Scan').closest('button');
    expect(scanButton).toHaveClass('opacity-40');
    expect(scanButton).toHaveAttribute('aria-disabled', 'true');

    const questionnaireLink = screen.getByText('Questionnaire').closest('a');
    expect(questionnaireLink).toBeInTheDocument();
  });

  it('enables Scan when hasProfile is true', () => {
    renderWithProvider(<AppSidebar user={mockUser} hasProfile={true} />);

    const scanLink = screen.getByText('Scan').closest('a');
    expect(scanLink).toBeInTheDocument();
    expect(scanLink).toHaveAttribute('href', '/scan');
  });

  it('renders user info section', () => {
    renderWithProvider(<AppSidebar user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderWithProvider(<AppSidebar user={mockUser} />);

    expect(screen.getByRole('button', { name: 'Log Out' })).toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked', async () => {
    const onLogout = vi.fn();
    const { user } = setupWithProvider(
      <AppSidebar user={mockUser} onLogout={onLogout} />
    );

    await user.click(screen.getByRole('button', { name: 'Log Out' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('shows logging out state when isLoggingOut is true', () => {
    renderWithProvider(<AppSidebar user={mockUser} isLoggingOut />);

    expect(
      screen.getByRole('button', { name: 'Logging out...' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Logging out...' })
    ).toBeDisabled();
  });

  it('shows email as fallback when displayName is not available', () => {
    renderWithProvider(<AppSidebar user={{ email: 'test@example.com' }} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
