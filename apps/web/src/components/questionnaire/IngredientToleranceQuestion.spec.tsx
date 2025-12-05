import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import {
  INGREDIENT_TOLERANCES,
  IngredientToleranceQuestion,
} from './IngredientToleranceQuestion';

describe('IngredientToleranceQuestion', () => {
  it('renders all ingredient tolerance options', () => {
    const { getByText } = setup(<IngredientToleranceQuestion />);

    for (const tolerance of INGREDIENT_TOLERANCES) {
      expect(getByText(tolerance.label)).toBeInTheDocument();
    }
  });

  it('renders question title and description', () => {
    const { getByText } = setup(<IngredientToleranceQuestion />);

    expect(getByText('5. Ingredient Tolerance')).toBeInTheDocument();
    expect(
      getByText('How sensitive is your scalp to ingredients?')
    ).toBeInTheDocument();
  });

  it('shows selected state when value is provided', () => {
    const { getByRole } = setup(
      <IngredientToleranceQuestion value="moderate" />
    );

    const radio = getByRole('radio', { name: 'Moderate' });
    expect(radio).toBeChecked();
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <IngredientToleranceQuestion onChange={onChange} />
    );

    await user.click(getByRole('radio', { name: 'Hypoallergenic' }));

    expect(onChange).toHaveBeenCalledWith('hypoallergenic');
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <IngredientToleranceQuestion error="Please select your tolerance level" />
    );

    expect(getByText('Please select your tolerance level')).toBeInTheDocument();
  });
});
