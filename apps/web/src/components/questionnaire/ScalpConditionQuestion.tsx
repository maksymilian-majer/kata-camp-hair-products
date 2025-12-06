'use client';

import { AnswerCard } from './AnswerCard';
import { AnswerCardGrid } from './AnswerCardGrid';
import { QuestionCard } from './QuestionCard';

const SCALP_CONDITIONS = [
  {
    value: 'seborrheic_dermatitis',
    label: 'Seborrheic Dermatitis',
    icon: '/answer-icons/seborrheic_dermatitis.png',
  },
  {
    value: 'psoriasis',
    label: 'Psoriasis',
    icon: '/answer-icons/psoriasis.png',
  },
  {
    value: 'atopic_dermatitis',
    label: 'Atopic Dermatitis (Eczema)',
    icon: '/answer-icons/atopic_dermatitis.png',
  },
  {
    value: 'severe_dandruff',
    label: 'Severe Dandruff',
    icon: '/answer-icons/severe_dandruff.png',
  },
  {
    value: 'sensitive_itchy',
    label: 'Just Sensitive/Itchy',
    icon: '/answer-icons/sensitive_itchy.png',
  },
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
  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue as ScalpCondition);
  };

  return (
    <div data-field="scalpCondition">
      <QuestionCard
        number={1}
        title="Scalp Condition"
        description="Select the condition that best describes your scalp"
        error={error}
      >
        <AnswerCardGrid>
          {SCALP_CONDITIONS.map((condition) => (
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

export { SCALP_CONDITIONS };
