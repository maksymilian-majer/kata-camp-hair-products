'use client';

import { Label, RadioGroup, RadioGroupItem } from '@hair-product-scanner/ui';

import { QuestionCard } from './QuestionCard';

const INGREDIENT_TOLERANCES = [
  { value: 'resilient', label: 'Resilient' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hypoallergenic', label: 'Hypoallergenic' },
] as const;

export type IngredientTolerance =
  (typeof INGREDIENT_TOLERANCES)[number]['value'];

type IngredientToleranceQuestionProps = {
  value?: IngredientTolerance;
  onChange?: (value: IngredientTolerance) => void;
  error?: string;
};

export function IngredientToleranceQuestion({
  value,
  onChange,
  error,
}: IngredientToleranceQuestionProps) {
  return (
    <div data-field="ingredientTolerance">
      <QuestionCard
        number={5}
        title="Ingredient Tolerance"
        description="How sensitive is your scalp to ingredients?"
        error={error}
      >
        <RadioGroup
          value={value}
          onValueChange={onChange as (value: string) => void}
        >
          {INGREDIENT_TOLERANCES.map((tolerance) => (
            <div key={tolerance.value} className="flex items-center gap-3">
              <RadioGroupItem
                value={tolerance.value}
                id={`tolerance-${tolerance.value}`}
              />
              <Label
                htmlFor={`tolerance-${tolerance.value}`}
                className="cursor-pointer font-normal"
              >
                {tolerance.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </QuestionCard>
    </div>
  );
}

export { INGREDIENT_TOLERANCES };
