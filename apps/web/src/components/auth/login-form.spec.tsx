import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('renders email field with label', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
  });

  it('renders password field with label', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
  });

  it('renders Log In button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    render(<LoginForm />);
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });

  it('displays error message when error prop provided', () => {
    render(<LoginForm error="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables form fields when disabled prop is true', () => {
    render(<LoginForm disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled();
  });

  it('calls onSubmit with FormData when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.any(FormData));
  });
});
