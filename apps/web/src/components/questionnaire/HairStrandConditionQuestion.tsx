'use client';

import { AnswerCard } from './AnswerCard';
import { AnswerCardGrid } from './AnswerCardGrid';
import { QuestionCard } from './QuestionCard';

const HAIR_STRAND_CONDITIONS = [
  {
    value: 'natural',
    label: 'Natural/Virgin',
    icon: '/answer-icons/natural.png',
  },
  {
    value: 'dyed',
    label: 'Dyed/Color-Treated',
    icon: '/answer-icons/dyed.png',
  },
  {
    value: 'bleached',
    label: 'Bleached/High Porosity',
    icon: '/answer-icons/bleached.png',
  },
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
  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue as HairStrandCondition);
  };

  return (
    <div data-field="hairStrandCondition">
      <QuestionCard
        number={4}
        title="Hair Strand Condition"
        description="What's the current state of your hair?"
        error={error}
      >
        <AnswerCardGrid>
          {HAIR_STRAND_CONDITIONS.map((condition) => (
            <AnswerCard
              key={condition.value}
              value={condition.value}
              label={condition.label}
              iconPath={condition.icon}
              isSelected={value === condition.value}
              onSelect={handleSelect}
            />
          ))}
        </AnswerCardGrid>
      </QuestionCard>
    </div>
  );
}

export { HAIR_STRAND_CONDITIONS };
