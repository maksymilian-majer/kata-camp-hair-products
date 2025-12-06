import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { QuestionnaireProfile } from '@hair-product-scanner/shared';
import { server } from '@/web/mocks/server';
import { render, screen, waitFor } from '@/web/testing/test-utils';

import Home from './page';

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

function setupWithProfile() {
  server.use(
    http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })),
    http.get('*/api/questionnaires/me', () =>
      HttpResponse.json({ profile: mockProfile })
    )
  );
}

function setupWithoutProfile() {
  server.use(
    http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })),
    http.get('*/api/questionnaires/me', () =>
      HttpResponse.json(
        { message: 'Not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    )
  );
}

describe('Home', () => {
  beforeEach(() => {
    localStorage.setItem('auth_access_token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('when user has a profile', () => {
    beforeEach(() => setupWithProfile());

    it('renders the page with welcome message', () => {
      render(<Home />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Welcome'
      );
    });

    it('renders scan history placeholder', async () => {
      render(<Home />);
      await waitFor(() => {
        expect(
          screen.getByText('Your scan history will appear here')
        ).toBeInTheDocument();
      });
    });

    it('renders the test toast button', async () => {
      render(<Home />);
      await waitFor(() => {
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
      });
    });

    it('shows loading state initially', () => {
      render(<Home />);
      expect(screen.getByText('Checking...')).toBeInTheDocument();
    });

    it('shows connected status when API returns ok', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Connected')).toBeInTheDocument();
      });
    });
  });

  describe('health check status variations', () => {
    it('shows disconnected status when API returns error status', async () => {
      server.use(
        http.get('*/api/health', () => HttpResponse.json({ status: 'error' })),
        http.get('*/api/questionnaires/me', () =>
          HttpResponse.json({ profile: mockProfile })
        )
      );
      localStorage.setItem('auth_access_token', 'test-token');

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });

      localStorage.clear();
    });

    it('shows disconnected status when API fails with 500', async () => {
      server.use(
        http.get('*/api/health', () => new HttpResponse(null, { status: 500 })),
        http.get('*/api/questionnaires/me', () =>
          HttpResponse.json({ profile: mockProfile })
        )
      );
      localStorage.setItem('auth_access_token', 'test-token');

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Disconnected')).toBeInTheDocument();
      });

      localStorage.clear();
    });
  });

  describe('when user has no profile', () => {
    beforeEach(() => setupWithoutProfile());

    it('shows ProfilePromptCard when no profile exists', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
      });
    });

    it('hides scan history and API status when no profile', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Profile')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Your scan history will appear here')
      ).not.toBeInTheDocument();
    });
  });
});
