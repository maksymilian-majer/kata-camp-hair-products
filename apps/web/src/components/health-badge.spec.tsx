import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HealthBadge } from './health-badge';

describe('HealthBadge', () => {
  it('renders loading state', () => {
    render(<HealthBadge status="loading" />);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('renders connected state', () => {
    render(<HealthBadge status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders disconnected state', () => {
    render(<HealthBadge status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });
});
