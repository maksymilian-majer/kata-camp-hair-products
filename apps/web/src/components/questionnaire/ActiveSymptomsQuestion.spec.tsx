import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import {
  ACTIVE_SYMPTOMS,
  ActiveSymptomsQuestion,
} from './ActiveSymptomsQuestion';

describe('ActiveSymptomsQuestion', () => {
  it('renders all symptom options', () => {
    const { getByText } = setup(<ActiveSymptomsQuestion />);

    for (const symptom of ACTIVE_SYMPTOMS) {
      expect(getByText(symptom.label)).toBeInTheDocument();
    }
  });

  it('renders question title and description', () => {
    const { getByText } = setup(<ActiveSymptomsQuestion />);

    expect(getByText('3. Active Symptoms')).toBeInTheDocument();
    expect(
      getByText("Select all symptoms you're currently experiencing")
    ).toBeInTheDocument();
  });

  it('shows checked state for selected symptoms', () => {
    const { getByRole } = setup(
      <ActiveSymptomsQuestion value={['itching', 'redness']} />
    );

    expect(getByRole('button', { name: 'Itching' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      getByRole('button', { name: 'Redness/Inflammation' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      getByRole('button', { name: 'Yellow/Greasy Scales' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange with added symptom when card is clicked', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <ActiveSymptomsQuestion value={['itching']} onChange={onChange} />
    );

    await user.click(getByRole('button', { name: 'Redness/Inflammation' }));

    expect(onChange).toHaveBeenCalledWith(['itching', 'redness']);
  });

  it('calls onChange with removed symptom when selected card is clicked', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <ActiveSymptomsQuestion
        value={['itching', 'redness']}
        onChange={onChange}
      />
    );

    await user.click(getByRole('button', { name: 'Itching' }));

    expect(onChange).toHaveBeenCalledWith(['redness']);
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <ActiveSymptomsQuestion error="Please select at least one symptom" />
    );

    expect(getByText('Please select at least one symptom')).toBeInTheDocument();
  });
});
