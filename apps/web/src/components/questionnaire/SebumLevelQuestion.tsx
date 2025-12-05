'use client';

import { Label, RadioGroup, RadioGroupItem } from '@hair-product-scanner/ui';

import { QuestionCard } from './QuestionCard';

const SEBUM_LEVELS = [
  { value: 'excessive', label: 'Excessive Sebum' },
  { value: 'moderate', label: 'Moderate/Normal' },
  { value: 'dry', label: 'Dry/Tight Skin' },
] as const;

export type SebumLevel = (typeof SEBUM_LEVELS)[number]['value'];

type SebumLevelQuestionProps = {
  value?: SebumLevel;
  onChange?: (value: SebumLevel) => void;
  error?: string;
};

export function SebumLevelQuestion({
  value,
  onChange,
  error,
}: SebumLevelQuestionProps) {
  return (
    <QuestionCard
      number={2}
      title="Sebum Level"
      description="How would you describe your scalp's oil production?"
      error={error}
    >
      <RadioGroup
        value={value}
        onValueChange={onChange as (value: string) => void}
      >
        {SEBUM_LEVELS.map((level) => (
          <div key={level.value} className="flex items-center gap-3">
            <RadioGroupItem value={level.value} id={`sebum-${level.value}`} />
            <Label
              htmlFor={`sebum-${level.value}`}
              className="cursor-pointer font-normal"
            >
              {level.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </QuestionCard>
  );
}

export { SEBUM_LEVELS };
