'use client';

import { AnswerCardGrid } from './AnswerCardGrid';
import { AnswerCardMulti } from './AnswerCardMulti';
import { QuestionCard } from './QuestionCard';

const ACTIVE_SYMPTOMS = [
  {
    value: 'itching',
    label: 'Itching',
    icon: '/answer-icons/itching.png',
  },
  {
    value: 'redness',
    label: 'Redness/Inflammation',
    icon: '/answer-icons/redness.png',
  },
  {
    value: 'yellow_scales',
    label: 'Yellow/Greasy Scales',
    icon: '/answer-icons/yellow_scales.png',
  },
  {
    value: 'white_flakes',
    label: 'White/Dry Flakes',
    icon: '/answer-icons/white_flakes.png',
  },
  {
    value: 'pain_burning',
    label: 'Pain/Burning',
    icon: '/answer-icons/pain_burning.png',
  },
] as const;

export type ActiveSymptom = (typeof ACTIVE_SYMPTOMS)[number]['value'];

const DEFAULT_VALUE: ActiveSymptom[] = [];

type ActiveSymptomsQuestionProps = {
  value?: ActiveSymptom[];
  onChange?: (value: ActiveSymptom[]) => void;
  error?: string;
};

export function ActiveSymptomsQuestion({
  value = DEFAULT_VALUE,
  onChange,
  error,
}: ActiveSymptomsQuestionProps) {
  const handleToggle = (symptomValue: string, selected: boolean) => {
    if (!onChange) return;

    const symptom = symptomValue as ActiveSymptom;
    if (selected) {
      onChange([...value, symptom]);
    } else {
      onChange(value.filter((v) => v !== symptom));
    }
  };

  return (
    <div data-field="activeSymptoms">
      <QuestionCard
        number={3}
        title="Active Symptoms"
        description="Select all symptoms you're currently experiencing"
        error={error}
      >
        <AnswerCardGrid>
          {ACTIVE_SYMPTOMS.map((symptom) => (
            <AnswerCardMulti
              key={symptom.value}
              value={symptom.value}
              label={symptom.label}
              iconPath={symptom.icon}
              isSelected={value.includes(symptom.value)}
              onToggle={handleToggle}
            />
          ))}
        </AnswerCardGrid>
      </QuestionCard>
    </div>
  );
}

export { ACTIVE_SYMPTOMS };
