'use client';

import { AnswerCard } from './AnswerCard';
import { AnswerCardGrid } from './AnswerCardGrid';
import { QuestionCard } from './QuestionCard';

const INGREDIENT_TOLERANCES = [
  {
    value: 'resilient',
    label: 'Resilient',
    icon: '/answer-icons/resilient.png',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    icon: '/answer-icons/moderate_tolerance.png',
  },
  {
    value: 'hypoallergenic',
    label: 'Hypoallergenic',
    icon: '/answer-icons/hypoallergenic.png',
  },
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
  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue as IngredientTolerance);
  };

  return (
    <div data-field="ingredientTolerance">
      <QuestionCard
        number={5}
        title="Ingredient Tolerance"
        description="How sensitive is your scalp to ingredients?"
        error={error}
      >
        <AnswerCardGrid>
          {INGREDIENT_TOLERANCES.map((tolerance) => (
            <AnswerCard
              key={tolerance.value}
              value={tolerance.value}
              label={tolerance.label}
              iconPath={tolerance.icon}
              isSelected={value === tolerance.value}
              onSelect={handleSelect}
            />
          ))}
        </AnswerCardGrid>
      </QuestionCard>
    </div>
  );
}

export { INGREDIENT_TOLERANCES };
