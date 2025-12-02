import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('renders password input field', () => {
    render(<PasswordInput placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('renders with password type by default', () => {
    render(<PasswordInput placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('toggles password visibility when eye icon clicked', () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('passes additional props to input', () => {
    render(<PasswordInput placeholder="Test" disabled />);
    expect(screen.getByPlaceholderText('Test')).toBeDisabled();
  });
});
