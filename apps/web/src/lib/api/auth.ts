import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from '@hair-product-scanner/shared';
import { env } from '@/web/app/env';

const ACCESS_TOKEN_KEY = 'auth_access_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Request failed' }));
    throw new AuthApiError(
      error.message || 'Request failed',
      error.code || 'UNKNOWN_ERROR',
      response.status
    );
  }
  return response.json();
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${env.BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<LoginResponse>(response);
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch(`${env.BACKEND_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<SignupResponse>(response);
}

export async function logout(): Promise<void> {
  const token = getStoredToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.BACKEND_URL}/api/auth/logout`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    throw new AuthApiError(
      'Failed to logout',
      'LOGOUT_FAILED',
      response.status
    );
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${env.BACKEND_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401) {
    return null;
  }
  return handleResponse<User>(response);
}
