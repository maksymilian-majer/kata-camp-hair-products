'use client';

import { Label, RadioGroup, RadioGroupItem } from '@hair-product-scanner/ui';

import { QuestionCard } from './QuestionCard';

const SCALP_CONDITIONS = [
  { value: 'seborrheic_dermatitis', label: 'Seborrheic Dermatitis' },
  { value: 'psoriasis', label: 'Psoriasis' },
  { value: 'atopic_dermatitis', label: 'Atopic Dermatitis (Eczema)' },
  { value: 'severe_dandruff', label: 'Severe Dandruff' },
  { value: 'sensitive_itchy', label: 'Just Sensitive/Itchy' },
] as const;

export type ScalpCondition = (typeof SCALP_CONDITIONS)[number]['value'];

type ScalpConditionQuestionProps = {
  value?: ScalpCondition;
  onChange?: (value: ScalpCondition) => void;
  error?: string;
};

export function ScalpConditionQuestion({
  value,
  onChange,
  error,
}: ScalpConditionQuestionProps) {
  return (
    <QuestionCard
      number={1}
      title="Scalp Condition"
      description="Select the condition that best describes your scalp"
      error={error}
    >
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
      >
        {SCALP_CONDITIONS.map((condition) => (
          <div key={condition.value} className="flex items-center gap-3">
            <RadioGroupItem
              value={condition.value}
              id={`scalp-${condition.value}`}
            />
            <Label
              htmlFor={`scalp-${condition.value}`}
              className="cursor-pointer font-normal"
            >
              {condition.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </QuestionCard>
  );
}

export { SCALP_CONDITIONS };
