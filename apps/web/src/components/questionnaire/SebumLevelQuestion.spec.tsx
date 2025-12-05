import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import { SEBUM_LEVELS, SebumLevelQuestion } from './SebumLevelQuestion';

describe('SebumLevelQuestion', () => {
  it('renders all sebum level options', () => {
    const { getByText } = setup(<SebumLevelQuestion />);

    for (const level of SEBUM_LEVELS) {
      expect(getByText(level.label)).toBeInTheDocument();
    }
  });

  it('renders question title and description', () => {
    const { getByText } = setup(<SebumLevelQuestion />);

    expect(getByText('2. Sebum Level')).toBeInTheDocument();
    expect(
      getByText("How would you describe your scalp's oil production?")
    ).toBeInTheDocument();
  });

  it('shows selected state when value is provided', () => {
    const { getByRole } = setup(<SebumLevelQuestion value="excessive" />);

    const radio = getByRole('radio', { name: 'Excessive Sebum' });
    expect(radio).toBeChecked();
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    const { user, getByRole } = setup(
      <SebumLevelQuestion onChange={onChange} />
    );

    await user.click(getByRole('radio', { name: 'Dry/Tight Skin' }));

    expect(onChange).toHaveBeenCalledWith('dry');
  });

  it('renders error message when provided', () => {
    const { getByText } = setup(
      <SebumLevelQuestion error="Please select a sebum level" />
    );

    expect(getByText('Please select a sebum level')).toBeInTheDocument();
  });
});
