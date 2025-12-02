import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignupForm } from './signup-form';

describe('SignupForm', () => {
  it('renders display name field with optional label', () => {
    render(<SignupForm />);
    expect(
      screen.getByPlaceholderText(/enter your display name/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument();
  });

  it('renders email field with label', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
  });

  it('renders password field with label', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/create a password/i)
    ).toBeInTheDocument();
  });

  it('renders confirm password field with label', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/confirm your password/i)
    ).toBeInTheDocument();
  });

  it('renders terms checkbox with link', () => {
    render(<SignupForm />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /terms and conditions/i })
    ).toHaveAttribute('href', '/terms');
  });

  it('renders Create Account button', () => {
    render(<SignupForm />);
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<SignupForm />);
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute(
      'href',
      '/login'
    );
  });

  it('displays error message when error prop provided', () => {
    render(<SignupForm error="Email already exists" />);
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('disables form fields when disabled prop is true', () => {
    render(<SignupForm disabled />);
    expect(
      screen.getByPlaceholderText(/enter your display name/i)
    ).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeDisabled();
  });

  it('calls onSubmit with FormData when form is submitted', () => {
    const onSubmit = vi.fn();
    render(<SignupForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.any(FormData));
  });
});
