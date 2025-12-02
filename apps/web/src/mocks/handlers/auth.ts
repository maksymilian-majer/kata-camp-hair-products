import { delay, http, HttpResponse } from 'msw';

import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from '@hair-product-scanner/shared';

const mockUsers: Map<string, User & { password: string }> = new Map([
  [
    'alex@example.com',
    {
      id: '1',
      email: 'alex@example.com',
      displayName: 'Alex',
      password: 'SecurePass1!',
      createdAt: '2024-01-15T10:00:00Z',
    },
  ],
]);

let currentUser: User | null = null;

export const authHandlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as LoginRequest;

    const user = mockUsers.get(body.email);
    if (!user || user.password !== body.password) {
      return HttpResponse.json(
        { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;
    currentUser = userWithoutPassword;

    const response: LoginResponse = {
      accessToken: `mock-token-${user.id}`,
      user: userWithoutPassword,
    };

    return HttpResponse.json(response);
  }),

  http.post('*/api/auth/signup', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as SignupRequest;

    if (mockUsers.has(body.email)) {
      return HttpResponse.json(
        {
          message: 'An account with this email already exists',
          code: 'EMAIL_EXISTS',
        },
        { status: 409 }
      );
    }

    const newUser: User & { password: string } = {
      id: crypto.randomUUID(),
      email: body.email,
      displayName: body.displayName || null,
      password: body.password,
      createdAt: new Date().toISOString(),
    };

    mockUsers.set(body.email, newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    currentUser = userWithoutPassword;

    const response: SignupResponse = {
      accessToken: `mock-token-${newUser.id}`,
      user: userWithoutPassword,
    };

    return HttpResponse.json(response, { status: 201 });
  }),

  http.post('*/api/auth/logout', async () => {
    await delay(100);
    currentUser = null;
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/api/auth/me', async () => {
    await delay(100);
    if (!currentUser) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json(currentUser);
  }),
];
