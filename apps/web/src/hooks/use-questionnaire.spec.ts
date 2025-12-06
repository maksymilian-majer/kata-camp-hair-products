import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/web/mocks/server';
import { createQueryWrapper, renderHook, waitFor } from '@/web/testing';

import { useQuestionnaire, useSaveQuestionnaire } from './use-questionnaire';

const mockProfile = {
  id: '1',
  userId: 'user-1',
  scalpCondition: 'seborrheic_dermatitis',
  sebumLevel: 'excessive',
  activeSymptoms: ['itching', 'redness'],
  hairStrandCondition: 'natural',
  ingredientTolerance: 'moderate',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

describe('useQuestionnaire', () => {
  beforeEach(() => {
    server.resetHandlers();
    localStorage.setItem('auth_access_token', 'mock-token');
  });

  it('returns existing profile data from API', async () => {
    server.use(
      http.get('*/api/questionnaires/me', () =>
        HttpResponse.json({ profile: mockProfile })
      )
    );

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });

  it('returns null when API returns 404 (no profile)', async () => {
    server.use(
      http.get('*/api/questionnaires/me', () =>
        HttpResponse.json(
          { message: 'Questionnaire not found', code: 'NOT_FOUND' },
          { status: 404 }
        )
      )
    );

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it('returns null when user is not authenticated', async () => {
    localStorage.removeItem('auth_access_token');

    const { result } = renderHook(() => useQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});

describe('useSaveQuestionnaire', () => {
  beforeEach(() => {
    server.resetHandlers();
    localStorage.setItem('auth_access_token', 'mock-token');
  });

  it('saves questionnaire and returns profile on success', async () => {
    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json({ profile: mockProfile }, { status: 201 })
      )
    );

    const { result } = renderHook(() => useSaveQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      scalpCondition: 'seborrheic_dermatitis',
      sebumLevel: 'excessive',
      activeSymptoms: ['itching', 'redness'],
      hairStrandCondition: 'natural',
      ingredientTolerance: 'moderate',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockProfile);
  });

  it('returns error when validation fails', async () => {
    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json(
          {
            message: 'Please select at least one symptom',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        )
      )
    );

    const { result } = renderHook(() => useSaveQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      scalpCondition: 'seborrheic_dermatitis',
      sebumLevel: 'excessive',
      activeSymptoms: [],
      hairStrandCondition: 'natural',
      ingredientTolerance: 'moderate',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(
      'Please select at least one symptom'
    );
  });

  it('updates existing profile successfully', async () => {
    const updatedProfile = {
      ...mockProfile,
      scalpCondition: 'psoriasis',
      updatedAt: '2024-01-16T10:00:00Z',
    };

    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json({ profile: updatedProfile }, { status: 200 })
      )
    );

    const { result } = renderHook(() => useSaveQuestionnaire(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({
      scalpCondition: 'psoriasis',
      sebumLevel: 'excessive',
      activeSymptoms: ['itching', 'redness'],
      hairStrandCondition: 'natural',
      ingredientTolerance: 'moderate',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.scalpCondition).toBe('psoriasis');
  });
});
