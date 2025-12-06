import { describe, expect, it, vi } from 'vitest';

import { render, screen, setup } from '@/web/testing/test-utils';

import { MobileBottomNav } from './mobile-bottom-nav';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MobileBottomNav', () => {
  const mockUser = {
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  it('renders all three nav tabs with icons and labels', () => {
    render(<MobileBottomNav user={mockUser} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Questionnaire')).toBeInTheDocument();
    expect(screen.getByText('Scan')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders navigation with proper role and label', () => {
    render(<MobileBottomNav user={mockUser} />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('shows Scan disabled when hasProfile is false', () => {
    render(<MobileBottomNav user={mockUser} hasProfile={false} />);

    const scanButton = screen.getByText('Scan').closest('button');
    expect(scanButton).toBeDisabled();
    expect(scanButton).toHaveAttribute('aria-disabled', 'true');
    expect(scanButton).toHaveAttribute('aria-label', 'Scan, disabled');

    const questionnaireLink = screen.getByText('Questionnaire').closest('a');
    expect(questionnaireLink).toBeInTheDocument();
  });

  it('enables Scan when hasProfile is true', () => {
    render(<MobileBottomNav user={mockUser} hasProfile={true} />);

    const scanLink = screen.getByText('Scan').closest('a');
    expect(scanLink).toBeInTheDocument();
    expect(scanLink).toHaveAttribute('href', '/scan');
  });

  it('shows active tab with primary color', () => {
    render(<MobileBottomNav user={mockUser} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveClass('text-primary');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('opens profile sheet when profile button is clicked', async () => {
    const { user } = setup(<MobileBottomNav user={mockUser} />);

    await user.click(screen.getByText('Profile'));

    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked in sheet', async () => {
    const onLogout = vi.fn();
    const { user } = setup(
      <MobileBottomNav user={mockUser} onLogout={onLogout} />
    );

    await user.click(screen.getByText('Profile'));
    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('shows logging out state when isLoggingOut is true', async () => {
    const { user } = setup(<MobileBottomNav user={mockUser} isLoggingOut />);

    await user.click(screen.getByText('Profile'));

    expect(
      screen.getByRole('button', { name: 'Logging out...' })
    ).toBeDisabled();
  });
});
