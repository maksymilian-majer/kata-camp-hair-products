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

    expect(getByRole('checkbox', { name: 'Itching' })).toBeChecked();
    expect(
      getByRole('checkbox', { name: 'Redness/Inflammation' })
    ).toBeChecked();
    expect(
      getByRole('checkbox', { name: 'Yellow/Greasy Scales' })
    ).not.toBeChecked();
  });

  it('calls onChange with added symptom when checkbox is checked', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <ActiveSymptomsQuestion value={['itching']} onChange={onChange} />
    );

    await user.click(getByRole('checkbox', { name: 'Redness/Inflammation' }));

    expect(onChange).toHaveBeenCalledWith(['itching', 'redness']);
  });

  it('calls onChange with removed symptom when checkbox is unchecked', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <ActiveSymptomsQuestion
        value={['itching', 'redness']}
        onChange={onChange}
      />
    );

    await user.click(getByRole('checkbox', { name: 'Itching' }));

    expect(onChange).toHaveBeenCalledWith(['redness']);
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <ActiveSymptomsQuestion error="Please select at least one symptom" />
    );

    expect(getByText('Please select at least one symptom')).toBeInTheDocument();
  });
});
