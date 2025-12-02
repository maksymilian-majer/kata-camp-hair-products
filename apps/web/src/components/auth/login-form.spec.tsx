import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { server } from '@/web/mocks/server';
import { useAuthStore } from '@/web/stores';
import { setup } from '@/web/testing';

import { LoginForm } from './login-form';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function setupLoginHandler() {
  server.use(
    http.post('*/api/auth/login', async ({ request }) => {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };
      if (
        body.email === 'alex@example.com' &&
        body.password === 'SecurePass1!'
      ) {
        return HttpResponse.json({
          accessToken: 'mock-token-1',
          user: {
            id: '1',
            email: 'alex@example.com',
            displayName: 'Alex',
            createdAt: '2024-01-15T10:00:00Z',
          },
        });
      }
      return HttpResponse.json(
        { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    })
  );
}

describe('LoginForm rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    setupLoginHandler();
  });

  it('renders email field with label', () => {
    setup(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i)
    ).toBeInTheDocument();
  });

  it('renders password field with label', () => {
    setup(<LoginForm />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
  });

  it('renders Log In button', () => {
    setup(<LoginForm />);
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    setup(<LoginForm />);
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });
});

describe('LoginForm validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    setupLoginHandler();
  });

  it('shows validation error for empty email', async () => {
    const { user } = setup(<LoginForm />);
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for empty password', async () => {
    const { user } = setup(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});

describe('LoginForm submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    setupLoginHandler();
  });

  it('submits form with valid credentials and redirects', async () => {
    const { user } = setup(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message for invalid credentials', async () => {
    const { user } = setup(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });
  });

  it('stores auth token on successful login', async () => {
    const { user } = setup(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.email).toBe('alex@example.com');
    });
  });
});
