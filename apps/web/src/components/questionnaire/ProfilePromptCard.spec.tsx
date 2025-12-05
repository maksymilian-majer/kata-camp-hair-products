import { describe, expect, it } from 'vitest';

import { render, screen } from '@/web/testing/test-utils';

import { ProfilePromptCard } from './ProfilePromptCard';

describe('ProfilePromptCard', () => {
  it('renders default title', () => {
    render(<ProfilePromptCard />);

    expect(screen.getByText('Welcome to Hairminator')).toBeInTheDocument();
  });

  it('renders default description', () => {
    render(<ProfilePromptCard />);

    expect(
      screen.getByText(
        'Complete your dermo-safety profile to get personalized product recommendations.'
      )
    ).toBeInTheDocument();
  });

  it('renders default CTA button with correct text', () => {
    render(<ProfilePromptCard />);

    expect(
      screen.getByRole('link', { name: /complete your profile/i })
    ).toBeInTheDocument();
  });

  it('renders CTA link with correct href', () => {
    render(<ProfilePromptCard />);

    const link = screen.getByRole('link', { name: /complete your profile/i });
    expect(link).toHaveAttribute('href', '/dashboard/questionnaire');
  });

  it('renders note about scanner access', () => {
    render(<ProfilePromptCard />);

    expect(
      screen.getByText(
        "Once your profile is complete, you'll be able to scan products and get personalized ingredient analysis."
      )
    ).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<ProfilePromptCard title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders custom description when provided', () => {
    render(<ProfilePromptCard description="Custom description text" />);

    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('renders custom CTA text when provided', () => {
    render(<ProfilePromptCard ctaText="Get Started" />);

    expect(
      screen.getByRole('link', { name: /get started/i })
    ).toBeInTheDocument();
  });

  it('renders custom CTA href when provided', () => {
    render(<ProfilePromptCard ctaHref="/custom-path" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/custom-path');
  });
});
