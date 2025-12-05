'use client';

import type { ReactNode } from 'react';
import { Loader2Icon } from 'lucide-react';

import { Button } from '@hair-product-scanner/ui';

import type { ActiveSymptom } from './ActiveSymptomsQuestion';
import { ActiveSymptomsQuestion } from './ActiveSymptomsQuestion';
import type { HairStrandCondition } from './HairStrandConditionQuestion';
import { HairStrandConditionQuestion } from './HairStrandConditionQuestion';
import type { IngredientTolerance } from './IngredientToleranceQuestion';
import { IngredientToleranceQuestion } from './IngredientToleranceQuestion';
import type { ScalpCondition } from './ScalpConditionQuestion';
import { ScalpConditionQuestion } from './ScalpConditionQuestion';
import type { SebumLevel } from './SebumLevelQuestion';
import { SebumLevelQuestion } from './SebumLevelQuestion';

export type QuestionnaireFormData = {
  scalpCondition?: ScalpCondition;
  sebumLevel?: SebumLevel;
  activeSymptoms: ActiveSymptom[];
  hairStrandCondition?: HairStrandCondition;
  ingredientTolerance?: IngredientTolerance;
};

export type QuestionnaireFormErrors = {
  scalpCondition?: string;
  sebumLevel?: string;
  activeSymptoms?: string;
  hairStrandCondition?: string;
  ingredientTolerance?: string;
  root?: string;
};

const DEFAULT_ERRORS: QuestionnaireFormErrors = {};

type QuestionnaireFormProps = {
  values: QuestionnaireFormData;
  errors?: QuestionnaireFormErrors;
  isSubmitting?: boolean;
  onValueChange: <K extends keyof QuestionnaireFormData>(
    field: K,
    value: QuestionnaireFormData[K]
  ) => void;
  onSubmit: () => void;
  submitLabel?: ReactNode;
};

export function QuestionnaireForm({
  values,
  errors = DEFAULT_ERRORS,
  isSubmitting = false,
  onValueChange,
  onSubmit,
  submitLabel = 'Save Profile',
}: QuestionnaireFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errors.root ? (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.root}
        </div>
      ) : null}

      <ScalpConditionQuestion
        value={values.scalpCondition}
        onChange={(value) => onValueChange('scalpCondition', value)}
        error={errors.scalpCondition}
      />

      <SebumLevelQuestion
        value={values.sebumLevel}
        onChange={(value) => onValueChange('sebumLevel', value)}
        error={errors.sebumLevel}
      />

      <ActiveSymptomsQuestion
        value={values.activeSymptoms}
        onChange={(value) => onValueChange('activeSymptoms', value)}
        error={errors.activeSymptoms}
      />

      <HairStrandConditionQuestion
        value={values.hairStrandCondition}
        onChange={(value) => onValueChange('hairStrandCondition', value)}
        error={errors.hairStrandCondition}
      />

      <IngredientToleranceQuestion
        value={values.ingredientTolerance}
        onChange={(value) => onValueChange('ingredientTolerance', value)}
        error={errors.ingredientTolerance}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
