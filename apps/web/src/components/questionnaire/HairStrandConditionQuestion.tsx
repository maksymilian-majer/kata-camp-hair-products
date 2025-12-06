'use client';

import { Label, RadioGroup, RadioGroupItem } from '@hair-product-scanner/ui';

import { QuestionCard } from './QuestionCard';

const HAIR_STRAND_CONDITIONS = [
  { value: 'natural', label: 'Natural/Virgin' },
  { value: 'dyed', label: 'Dyed/Color-Treated' },
  { value: 'bleached', label: 'Bleached/High Porosity' },
] as const;

export type HairStrandCondition =
  (typeof HAIR_STRAND_CONDITIONS)[number]['value'];

type HairStrandConditionQuestionProps = {
  value?: HairStrandCondition;
  onChange?: (value: HairStrandCondition) => void;
  error?: string;
};

export function HairStrandConditionQuestion({
  value,
  onChange,
  error,
}: HairStrandConditionQuestionProps) {
  return (
    <div data-field="hairStrandCondition">
      <QuestionCard
        number={4}
        title="Hair Strand Condition"
        description="What's the current state of your hair?"
        error={error}
      >
        <RadioGroup
          value={value}
          onValueChange={onChange as (value: string) => void}
        >
          {HAIR_STRAND_CONDITIONS.map((condition) => (
            <div key={condition.value} className="flex items-center gap-3">
              <RadioGroupItem
                value={condition.value}
                id={`hair-${condition.value}`}
              />
              <Label
                htmlFor={`hair-${condition.value}`}
                className="cursor-pointer font-normal"
              >
                {condition.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </QuestionCard>
    </div>
  );
}

export { HAIR_STRAND_CONDITIONS };
