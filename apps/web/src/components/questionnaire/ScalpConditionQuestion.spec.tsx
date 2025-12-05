import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import {
  SCALP_CONDITIONS,
  ScalpConditionQuestion,
} from './ScalpConditionQuestion';

describe('ScalpConditionQuestion', () => {
  it('renders all scalp condition options', () => {
    const { getByText } = setup(<ScalpConditionQuestion />);

    for (const condition of SCALP_CONDITIONS) {
      expect(getByText(condition.label)).toBeInTheDocument();
    }
  });

  it('renders question title and description', () => {
    const { getByText } = setup(<ScalpConditionQuestion />);

    expect(getByText('1. Scalp Condition')).toBeInTheDocument();
    expect(
      getByText('Select the condition that best describes your scalp')
    ).toBeInTheDocument();
  });

  it('shows selected state when value is provided', () => {
    const { getByRole } = setup(<ScalpConditionQuestion value="psoriasis" />);

    const radio = getByRole('radio', { name: 'Psoriasis' });
    expect(radio).toBeChecked();
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <ScalpConditionQuestion onChange={onChange} />
    );

    await user.click(getByRole('radio', { name: 'Seborrheic Dermatitis' }));

    expect(onChange).toHaveBeenCalledWith('seborrheic_dermatitis');
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <ScalpConditionQuestion error="Please select a scalp condition" />
    );

    expect(getByText('Please select a scalp condition')).toBeInTheDocument();
  });
});
