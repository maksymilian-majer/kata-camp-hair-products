'use client';

import { AnswerCard } from './AnswerCard';
import { AnswerCardGrid } from './AnswerCardGrid';
import { QuestionCard } from './QuestionCard';

const SEBUM_LEVELS = [
  {
    value: 'excessive',
    label: 'Excessive Sebum',
    icon: '/answer-icons/excessive.png',
  },
  {
    value: 'moderate',
    label: 'Moderate/Normal',
    icon: '/answer-icons/moderate.png',
  },
  {
    value: 'dry',
    label: 'Dry/Tight Skin',
    icon: '/answer-icons/dry.png',
  },
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
  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue as SebumLevel);
  };

  return (
    <div data-field="sebumLevel">
      <QuestionCard
        number={2}
        title="Sebum Level"
        description="How would you describe your scalp's oil production?"
        error={error}
      >
        <AnswerCardGrid>
          {SEBUM_LEVELS.map((level) => (
            <AnswerCard
              key={level.value}
              value={level.value}
              label={level.label}
              iconPath={level.icon}
              isSelected={value === level.value}
              onSelect={handleSelect}
            />
          ))}
        </AnswerCardGrid>
      </QuestionCard>
    </div>
  );
}

export { SEBUM_LEVELS };
