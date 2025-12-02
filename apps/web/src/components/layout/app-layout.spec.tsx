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
});
