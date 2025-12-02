import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { server } from '@/web/mocks/server';
import { render, screen, waitFor } from '@/web/testing/test-utils';

import Home from './page';

describe('Home', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/health', () => HttpResponse.json({ status: 'ok' }))
    );
  });

  it('renders the page with title', () => {
    render(<Home />);
    expect(screen.getByText('Hairminator')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Home />);
    expect(
      screen.getByText('Analyze hair product ingredients for your hair type')
    ).toBeInTheDocument();
  });

  it('renders the test toast button', () => {
    render(<Home />);
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
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

  it('shows disconnected status when API returns error status', async () => {
    server.use(
      http.get('*/api/health', () => HttpResponse.json({ status: 'error' }))
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  it('shows disconnected status when API fails with 500', async () => {
    server.use(
      http.get('*/api/health', () => new HttpResponse(null, { status: 500 }))
    );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });
});
