import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/web/mocks/server';
import { createQueryWrapper, renderHook, waitFor } from '@/web/testing';

import { useCurrentUser, useLogin, useLogout, useSignup } from './use-auth';

describe('useLogin', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('returns token and user on successful login', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({
          accessToken: 'mock-token',
          user: {
            id: '1',
            email: 'alex@example.com',
            displayName: 'Alex',
            createdAt: '2024-01-15T10:00:00Z',
          },
        })
      )
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      email: 'alex@example.com',
      password: 'SecurePass1!',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      accessToken: 'mock-token',
      user: {
        id: '1',
        email: 'alex@example.com',
        displayName: 'Alex',
        createdAt: '2024-01-15T10:00:00Z',
      },
    });
  });

  it('returns error for invalid credentials', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json(
          { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
          { status: 401 }
        )
      )
    );

    const { result } = renderHook(() => useLogin(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      email: 'wrong@example.com',
      password: 'wrongpassword',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Invalid email or password');
  });
});

describe('useSignup', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('creates user and returns token on successful signup', async () => {
    server.use(
      http.post('*/api/auth/signup', () =>
        HttpResponse.json(
          {
            accessToken: 'mock-token',
            user: {
              id: '2',
              email: 'new@example.com',
              displayName: 'New User',
              createdAt: '2024-01-15T10:00:00Z',
            },
          },
          { status: 201 }
        )
      )
    );

    const { result } = renderHook(() => useSignup(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      email: 'new@example.com',
      password: 'SecurePass1!',
      displayName: 'New User',
      acceptedTerms: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.user.email).toBe('new@example.com');
    expect(result.current.data?.accessToken).toBe('mock-token');
  });

  it('returns error when email already exists', async () => {
    server.use(
      http.post('*/api/auth/signup', () =>
        HttpResponse.json(
          {
            message: 'An account with this email already exists',
            code: 'EMAIL_EXISTS',
          },
          { status: 409 }
        )
      )
    );

    const { result } = renderHook(() => useSignup(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      email: 'existing@example.com',
      password: 'SecurePass1!',
      acceptedTerms: true,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(
      'An account with this email already exists'
    );
  });
});

describe('useCurrentUser', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('returns null when user is not authenticated', async () => {
    server.use(
      http.get('*/api/auth/me', () => new HttpResponse(null, { status: 401 }))
    );

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('returns user when authenticated', async () => {
    const mockUser = {
      id: '1',
      email: 'alex@example.com',
      displayName: 'Alex',
      createdAt: '2024-01-15T10:00:00Z',
    };
    server.use(http.get('*/api/auth/me', () => HttpResponse.json(mockUser)));

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('logs out successfully', async () => {
    server.use(
      http.post(
        '*/api/auth/logout',
        () => new HttpResponse(null, { status: 204 })
      )
    );

    const { result } = renderHook(() => useLogout(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
