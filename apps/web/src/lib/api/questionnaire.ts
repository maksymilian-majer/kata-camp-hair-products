import type {
  GetQuestionnaireResponse,
  QuestionnaireProfile,
  SaveQuestionnaireRequest,
  SaveQuestionnaireResponse,
} from '@hair-product-scanner/shared';
import { env } from '@/web/app/env';

const ACCESS_TOKEN_KEY = 'auth_access_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export class QuestionnaireApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'QuestionnaireApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Request failed' }));
    throw new QuestionnaireApiError(
      error.message || 'Request failed',
      error.code || 'UNKNOWN_ERROR',
      response.status
    );
  }
  return response.json();
}

export async function getQuestionnaire(): Promise<QuestionnaireProfile | null> {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  const response = await fetch(`${env.BACKEND_URL}/api/questionnaires/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  const data = await handleResponse<GetQuestionnaireResponse>(response);
  return data.profile;
}

export async function saveQuestionnaire(
  data: SaveQuestionnaireRequest
): Promise<QuestionnaireProfile> {
  const token = getStoredToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${env.BACKEND_URL}/api/questionnaires`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  const result = await handleResponse<SaveQuestionnaireResponse>(response);
  return result.profile;
}
