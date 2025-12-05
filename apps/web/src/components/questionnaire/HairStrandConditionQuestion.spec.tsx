import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import {
  HAIR_STRAND_CONDITIONS,
  HairStrandConditionQuestion,
} from './HairStrandConditionQuestion';

describe('HairStrandConditionQuestion', () => {
  it('renders all hair strand condition options', () => {
    const { getByText } = setup(<HairStrandConditionQuestion />);

    for (const condition of HAIR_STRAND_CONDITIONS) {
      expect(getByText(condition.label)).toBeInTheDocument();
    }
  });

  it('renders question title and description', () => {
    const { getByText } = setup(<HairStrandConditionQuestion />);

    expect(getByText('4. Hair Strand Condition')).toBeInTheDocument();
    expect(
      getByText("What's the current state of your hair?")
    ).toBeInTheDocument();
  });

  it('shows selected state when value is provided', () => {
    const { getByRole } = setup(<HairStrandConditionQuestion value="dyed" />);

    const radio = getByRole('radio', { name: 'Dyed/Color-Treated' });
    expect(radio).toBeChecked();
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <HairStrandConditionQuestion onChange={onChange} />
    );

    await user.click(getByRole('radio', { name: 'Bleached/High Porosity' }));

    expect(onChange).toHaveBeenCalledWith('bleached');
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <HairStrandConditionQuestion error="Please select your hair condition" />
    );

    expect(getByText('Please select your hair condition')).toBeInTheDocument();
  });
});
