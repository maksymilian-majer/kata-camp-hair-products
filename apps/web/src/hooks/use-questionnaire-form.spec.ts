import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuestionnaireProfile } from '@hair-product-scanner/shared';
import { server } from '@/web/mocks/server';
import { createQueryWrapper, renderHook, waitFor } from '@/web/testing';

import { useQuestionnaireForm } from './use-questionnaire-form';

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

vi.mock('@hair-product-scanner/ui', async () => {
  const actual = await vi.importActual('@hair-product-scanner/ui');
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

const mockProfile: QuestionnaireProfile = {
  id: 'test-id',
  userId: 'user-id',
  scalpCondition: 'seborrheic_dermatitis',
  sebumLevel: 'excessive',
  activeSymptoms: ['itching', 'redness'],
  hairStrandCondition: 'natural',
  ingredientTolerance: 'moderate',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('useQuestionnaireForm', () => {
  beforeEach(() => {
    localStorage.setItem('auth_access_token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with empty values when no existing profile', () => {
    const { result } = renderHook(() => useQuestionnaireForm(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.values.scalpCondition).toBeUndefined();
    expect(result.current.values.sebumLevel).toBeUndefined();
    expect(result.current.values.activeSymptoms).toEqual([]);
    expect(result.current.isEditing).toBe(false);
  });

  it('initializes with existing profile values when provided', () => {
    const { result } = renderHook(
      () => useQuestionnaireForm({ existingProfile: mockProfile }),
      { wrapper: createQueryWrapper() }
    );

    expect(result.current.values.scalpCondition).toBe('seborrheic_dermatitis');
    expect(result.current.values.sebumLevel).toBe('excessive');
    expect(result.current.values.activeSymptoms).toEqual([
      'itching',
      'redness',
    ]);
    expect(result.current.isEditing).toBe(true);
  });

  it('updates values when setValue is called', async () => {
    const { result } = renderHook(() => useQuestionnaireForm(), {
      wrapper: createQueryWrapper(),
    });

    result.current.setValue('scalpCondition', 'psoriasis');

    await waitFor(() => {
      expect(result.current.values.scalpCondition).toBe('psoriasis');
    });
  });

  it('submits successfully and redirects to dashboard', async () => {
    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json({ profile: mockProfile }, { status: 201 })
      )
    );

    const { result } = renderHook(() => useQuestionnaireForm(), {
      wrapper: createQueryWrapper(),
    });

    result.current.setValue('scalpCondition', 'seborrheic_dermatitis');
    result.current.setValue('sebumLevel', 'excessive');
    result.current.setValue('activeSymptoms', ['itching']);
    result.current.setValue('hairStrandCondition', 'natural');
    result.current.setValue('ingredientTolerance', 'moderate');

    result.current.onSubmit();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('calls custom onSuccess when provided', async () => {
    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json({ profile: mockProfile }, { status: 201 })
      )
    );

    const onSuccess = vi.fn();

    const { result } = renderHook(() => useQuestionnaireForm({ onSuccess }), {
      wrapper: createQueryWrapper(),
    });

    result.current.setValue('scalpCondition', 'seborrheic_dermatitis');
    result.current.setValue('sebumLevel', 'excessive');
    result.current.setValue('activeSymptoms', ['itching']);
    result.current.setValue('hairStrandCondition', 'natural');
    result.current.setValue('ingredientTolerance', 'moderate');

    result.current.onSubmit();

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows isSubmitting while mutation is pending', async () => {
    server.use(
      http.post('*/api/questionnaires', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ profile: mockProfile }, { status: 201 });
      })
    );

    const { result } = renderHook(() => useQuestionnaireForm(), {
      wrapper: createQueryWrapper(),
    });

    result.current.setValue('scalpCondition', 'seborrheic_dermatitis');
    result.current.setValue('sebumLevel', 'excessive');
    result.current.setValue('activeSymptoms', ['itching']);
    result.current.setValue('hairStrandCondition', 'natural');
    result.current.setValue('ingredientTolerance', 'moderate');

    expect(result.current.isSubmitting).toBe(false);

    result.current.onSubmit();

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
