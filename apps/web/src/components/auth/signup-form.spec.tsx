import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SignupRequest } from '@hair-product-scanner/shared';
import { server } from '@/web/mocks/server';
import { useAuthStore } from '@/web/stores';
import { setup } from '@/web/testing';

import { SignupForm } from './signup-form';

const mockPush = vi.fn();
const registeredEmails = new Set(['alex@example.com']);

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

function setupSignupHandler() {
  server.use(
    http.post('*/api/auth/signup', async ({ request }) => {
      const body = (await request.json()) as SignupRequest;
      if (registeredEmails.has(body.email)) {
        return HttpResponse.json(
          {
            message: 'An account with this email already exists',
            code: 'EMAIL_EXISTS',
          },
          { status: 409 }
        );
      }
      return HttpResponse.json(
        {
          accessToken: 'mock-token-new',
          user: {
            id: crypto.randomUUID(),
            email: body.email,
            displayName: body.displayName || null,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    })
  );
}

describe('SignupForm client-side validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    setupSignupHandler();
  });

  it('shows error for weak password', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'weak');
    await user.type(screen.getByLabelText('Confirm Password'), 'weak');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it('shows error for mismatched passwords', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.type(
      screen.getByLabelText('Confirm Password'),
      'DifferentPass1!'
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error when terms not accepted', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/you must accept the terms and conditions/i)
      ).toBeInTheDocument();
    });
  });
});

describe('SignupForm submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    setupSignupHandler();
  });

  it('redirects on successful signup', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'newuser@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass1!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error for existing email', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'alex@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass1!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/an account with this email already exists/i)
      ).toBeInTheDocument();
    });
  });

  it('stores auth token on success', async () => {
    const { user } = setup(<SignupForm />);
    await user.type(screen.getByLabelText('Email'), 'newuser2@example.com');
    await user.type(screen.getByLabelText('Password'), 'SecurePass1!');
    await user.type(screen.getByLabelText('Confirm Password'), 'SecurePass1!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
});
