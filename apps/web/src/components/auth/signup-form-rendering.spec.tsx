import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing';

import { SignupForm } from './signup-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('SignupForm rendering', () => {
  it('renders display name field with optional label', () => {
    setup(<SignupForm />);
    expect(
      screen.getByPlaceholderText(/enter your display name/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument();
  });

  it('renders email field with label', () => {
    setup(<SignupForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
  });

  it('renders password fields', () => {
    setup(<SignupForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('renders terms checkbox with link', () => {
    setup(<SignupForm />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /terms and conditions/i })
    ).toHaveAttribute('href', '/terms');
  });

  it('renders Create Account button and login link', () => {
    setup(<SignupForm />);
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });
});
