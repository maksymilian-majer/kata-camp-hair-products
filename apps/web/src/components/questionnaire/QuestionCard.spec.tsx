import { describe, expect, it } from 'vitest';

import { render, screen } from '@/web/testing/test-utils';

import { QuestionCard } from './QuestionCard';

describe('QuestionCard', () => {
  it('renders title with number', () => {
    render(
      <QuestionCard
        number={1}
        title="Test Question"
        description="Test description"
      >
        <div>Content</div>
      </QuestionCard>
    );

    expect(screen.getByText('1. Test Question')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <QuestionCard
        number={1}
        title="Test Question"
        description="This is a test description"
      >
        <div>Content</div>
      </QuestionCard>
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <QuestionCard
        number={1}
        title="Test Question"
        description="Test description"
      >
        <div data-testid="child-content">Child Content</div>
      </QuestionCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <QuestionCard
        number={1}
        title="Test Question"
        description="Test description"
        error="This field is required"
      >
        <div>Content</div>
      </QuestionCard>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('does not render error message when not provided', () => {
    render(
      <QuestionCard
        number={1}
        title="Test Question"
        description="Test description"
      >
        <div>Content</div>
      </QuestionCard>
    );

    expect(
      screen.queryByText('This field is required')
    ).not.toBeInTheDocument();
  });
});
