import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { QuestionnaireProfile } from '@hair-product-scanner/shared';
import { server } from '@/web/mocks/server';
import { render, screen, setup, waitFor } from '@/web/testing/test-utils';

import { QuestionnaireContainer } from './QuestionnaireContainer';

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

function setupNoProfile() {
  server.use(
    http.get('*/api/questionnaires/me', () =>
      HttpResponse.json(
        { message: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    )
  );
}

function setupWithProfile() {
  server.use(
    http.get('*/api/questionnaires/me', () =>
      HttpResponse.json({ profile: mockProfile })
    )
  );
}

async function fillForm(user: ReturnType<typeof setup>['user']) {
  await user.click(
    screen.getByRole('button', { name: 'Seborrheic Dermatitis' })
  );
  await user.click(screen.getByRole('button', { name: 'Excessive Sebum' }));
  await user.click(screen.getByRole('button', { name: 'Itching' }));
  await user.click(screen.getByRole('button', { name: 'Natural/Virgin' }));
  await user.click(screen.getByRole('button', { name: 'Moderate' }));
}

beforeEach(() => {
  localStorage.setItem('auth_access_token', 'test-token');
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('QuestionnaireContainer - form rendering', () => {
  beforeEach(() => setupNoProfile());

  it('renders the questionnaire form', async () => {
    render(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });

    expect(screen.getByText(/1\. Scalp Condition/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Sebum Level/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Active Symptoms/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Hair Strand Condition/)).toBeInTheDocument();
    expect(screen.getByText(/5\. Ingredient Tolerance/)).toBeInTheDocument();
  });
});

describe('QuestionnaireContainer - form validation', () => {
  beforeEach(() => setupNoProfile());

  it('shows validation errors when submitting incomplete form', async () => {
    const { user } = setup(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => {
      expect(
        screen.getByText('Please select at least one symptom')
      ).toBeInTheDocument();
    });
  });

  it('shows error when no symptoms selected', async () => {
    const { user } = setup(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Seborrheic Dermatitis' })
    );
    await user.click(screen.getByRole('button', { name: 'Excessive Sebum' }));
    await user.click(screen.getByRole('button', { name: 'Natural/Virgin' }));
    await user.click(screen.getByRole('button', { name: 'Moderate' }));
    await user.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => {
      expect(
        screen.getByText('Please select at least one symptom')
      ).toBeInTheDocument();
    });
  });
});

describe('QuestionnaireContainer - form submission', () => {
  beforeEach(() => setupNoProfile());

  it('submits form successfully and redirects', async () => {
    server.use(
      http.post('*/api/questionnaires', () =>
        HttpResponse.json({ profile: mockProfile }, { status: 201 })
      )
    );

    const { user } = setup(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows loading state during submission', async () => {
    server.use(
      http.post('*/api/questionnaires', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ profile: mockProfile }, { status: 201 });
      })
    );

    const { user } = setup(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
    });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Save Profile' }));

    await waitFor(() => {
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});

describe('QuestionnaireContainer - editing existing profile', () => {
  beforeEach(() => setupWithProfile());

  it('pre-fills form with existing profile values', async () => {
    render(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: 'Seborrheic Dermatitis' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Excessive Sebum' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Itching' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Redness/Inflammation' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Natural/Virgin' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Moderate' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('shows Update Profile button when editing', async () => {
    render(<QuestionnaireContainer />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Update Profile' })
      ).toBeInTheDocument();
    });
  });
});
