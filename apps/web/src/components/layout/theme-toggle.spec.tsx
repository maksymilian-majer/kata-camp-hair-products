import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen, setup } from '@/web/testing/test-utils';

import { ThemeToggle } from './theme-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

let mockTheme: string | undefined = 'system';

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = 'system';
    mockSetTheme.mockClear();
  });

  it('renders with system theme by default', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('renders with light theme', () => {
    mockTheme = 'light';
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
  });

  it('renders with dark theme', () => {
    mockTheme = 'dark';
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('cycles from system to light on click', async () => {
    mockTheme = 'system';
    const { user } = setup(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('cycles from light to dark on click', async () => {
    mockTheme = 'light';
    const { user } = setup(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('cycles from dark to system on click', async () => {
    mockTheme = 'dark';
    const { user } = setup(<ThemeToggle />);

    await user.click(screen.getByRole('button'));

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('defaults to system when theme is undefined', () => {
    mockTheme = undefined;
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('defaults to system when theme is an unknown value', () => {
    mockTheme = 'unknown-theme';
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });
});
