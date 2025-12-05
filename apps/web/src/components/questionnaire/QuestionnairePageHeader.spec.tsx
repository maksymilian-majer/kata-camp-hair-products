import { describe, expect, it } from 'vitest';

import { render, screen } from '@/web/testing/test-utils';

import { QuestionnairePageHeader } from './QuestionnairePageHeader';

describe('QuestionnairePageHeader', () => {
  it('renders default title', () => {
    render(<QuestionnairePageHeader />);

    expect(screen.getByText('Dermo-Safety Questionnaire')).toBeInTheDocument();
  });

  it('renders default description', () => {
    render(<QuestionnairePageHeader />);

    expect(
      screen.getByText(
        'Help us understand your scalp and hair conditions for personalized product recommendations.'
      )
    ).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<QuestionnairePageHeader title="Edit Your Profile" />);

    expect(screen.getByText('Edit Your Profile')).toBeInTheDocument();
  });

  it('renders custom description when provided', () => {
    render(
      <QuestionnairePageHeader description="Update your scalp conditions." />
    );

    expect(
      screen.getByText('Update your scalp conditions.')
    ).toBeInTheDocument();
  });

  it('renders title as h1 heading', () => {
    render(<QuestionnairePageHeader />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Dermo-Safety Questionnaire');
  });
});
