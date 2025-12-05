import { describe, expect, it, vi } from 'vitest';

import { setup } from '@/web/testing/test-utils';

import type { QuestionnaireFormData } from './QuestionnaireForm';
import { QuestionnaireForm } from './QuestionnaireForm';

const defaultValues: QuestionnaireFormData = {
  scalpCondition: undefined,
  sebumLevel: undefined,
  activeSymptoms: [],
  hairStrandCondition: undefined,
  ingredientTolerance: undefined,
};

describe('QuestionnaireForm', () => {
  it('renders all 5 questions in order', () => {
    const { getByText } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(getByText('1. Scalp Condition')).toBeInTheDocument();
    expect(getByText('2. Sebum Level')).toBeInTheDocument();
    expect(getByText('3. Active Symptoms')).toBeInTheDocument();
    expect(getByText('4. Hair Strand Condition')).toBeInTheDocument();
    expect(getByText('5. Ingredient Tolerance')).toBeInTheDocument();
  });

  it('renders save profile button', () => {
    const { getByRole } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(getByRole('button', { name: 'Save Profile' })).toBeInTheDocument();
  });

  it('renders custom submit label', () => {
    const { getByRole } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        submitLabel="Update Profile"
      />
    );

    expect(getByRole('button', { name: 'Update Profile' })).toBeInTheDocument();
  });

  it('shows loading state when submitting', () => {
    const { getByRole, getByText } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        isSubmitting
      />
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    const { user, getByRole } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    await user.click(getByRole('button', { name: 'Save Profile' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onValueChange when a field is changed', async () => {
    const onValueChange = vi.fn();
    const { user, getByRole } = setup(
      <QuestionnaireForm
        values={defaultValues}
        onValueChange={onValueChange}
        onSubmit={vi.fn()}
      />
    );

    await user.click(getByRole('radio', { name: 'Psoriasis' }));

    expect(onValueChange).toHaveBeenCalledWith('scalpCondition', 'psoriasis');
  });

  it('displays root error message when provided', () => {
    const { getByText } = setup(
      <QuestionnaireForm
        values={defaultValues}
        errors={{ root: 'An error occurred while saving' }}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(getByText('An error occurred while saving')).toBeInTheDocument();
  });

  it('displays field-level errors', () => {
    const { getByText } = setup(
      <QuestionnaireForm
        values={defaultValues}
        errors={{
          scalpCondition: 'Please select a scalp condition',
          activeSymptoms: 'Please select at least one symptom',
        }}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(getByText('Please select a scalp condition')).toBeInTheDocument();
    expect(getByText('Please select at least one symptom')).toBeInTheDocument();
  });
});
