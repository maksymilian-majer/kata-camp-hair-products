import { Home } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@/web/testing/test-utils';

import { NavItem } from './nav-item';

describe('NavItem', () => {
  it('renders with icon and label', () => {
    render(<NavItem icon={Home} label="Home" href="/dashboard" />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
  });

  it('renders active state correctly', () => {
    render(<NavItem icon={Home} label="Home" href="/dashboard" active />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('bg-accent');
  });

  it('renders disabled state correctly', () => {
    render(<NavItem icon={Home} label="Home" href="/dashboard" disabled />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const disabledItem = screen
      .getByLabelText('Home, disabled')
      .closest('span');
    expect(disabledItem).toHaveClass('cursor-not-allowed');
    expect(disabledItem).toHaveClass('opacity-50');
  });

  it('disabled item is focusable via tabIndex', () => {
    render(<NavItem icon={Home} label="Home" href="/dashboard" disabled />);

    const disabledSpan = screen.getByLabelText('Home, disabled');
    expect(disabledSpan).toHaveAttribute('tabindex', '0');
  });
});
