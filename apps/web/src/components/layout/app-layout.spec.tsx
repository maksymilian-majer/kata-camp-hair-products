import { describe, expect, it, vi } from 'vitest';

import { render, screen, setup } from '@/web/testing/test-utils';

import { AppLayout } from './app-layout';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('AppLayout', () => {
  const mockUser = {
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  it('renders children content', () => {
    render(
      <AppLayout user={mockUser}>
        <div data-testid="test-content">Test Content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('renders mobile nav on mobile (visible via CSS md:hidden)', () => {
    render(
      <AppLayout user={mockUser}>
        <div>Content</div>
      </AppLayout>
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('passes user info to profile sheet in mobile nav', async () => {
    const { user: userEvent } = setup(
      <AppLayout user={mockUser}>
        <div>Content</div>
      </AppLayout>
    );

    await userEvent.click(screen.getByText('Profile'));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('John Doe');
    expect(dialog).toHaveTextContent('john@example.com');
  });

  it('passes onLogout handler to mobile nav', async () => {
    const onLogout = vi.fn();
    const { user: userEvent } = setup(
      <AppLayout user={mockUser} onLogout={onLogout}>
        <div>Content</div>
      </AppLayout>
    );

    await userEvent.click(screen.getByText('Profile'));
    await userEvent.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(onLogout).toHaveBeenCalled();
  });

  it('enables Scan when hasProfile is true', () => {
    render(
      <AppLayout user={mockUser} hasProfile={true}>
        <div>Content</div>
      </AppLayout>
    );

    const scanLinks = screen.getAllByText('Scan');
    expect(scanLinks[0].closest('a')).toHaveAttribute('href', '/scan');
    expect(scanLinks[1].closest('a')).toHaveAttribute('href', '/scan');
  });

  it('disables Scan when hasProfile is false', () => {
    render(
      <AppLayout user={mockUser} hasProfile={false}>
        <div>Content</div>
      </AppLayout>
    );

    const scanButtons = screen.getAllByLabelText('Scan, disabled');
    expect(scanButtons).toHaveLength(2);
    scanButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
