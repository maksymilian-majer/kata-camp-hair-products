'use client';

import { Checkbox, Label } from '@hair-product-scanner/ui';

import { QuestionCard } from './QuestionCard';

const ACTIVE_SYMPTOMS = [
  { value: 'itching', label: 'Itching' },
  { value: 'redness', label: 'Redness/Inflammation' },
  { value: 'yellow_scales', label: 'Yellow/Greasy Scales' },
  { value: 'white_flakes', label: 'White/Dry Flakes' },
  { value: 'pain_burning', label: 'Pain/Burning' },
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
  const handleCheckedChange = (symptom: ActiveSymptom, checked: boolean) => {
    if (!onChange) return;

    if (checked) {
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
        <div className="flex flex-col gap-3">
          {ACTIVE_SYMPTOMS.map((symptom) => (
            <div key={symptom.value} className="flex items-center gap-3">
              <Checkbox
                id={`symptom-${symptom.value}`}
                checked={value.includes(symptom.value)}
                onCheckedChange={(checked) =>
                  handleCheckedChange(symptom.value, checked === true)
                }
              />
              <Label
                htmlFor={`symptom-${symptom.value}`}
                className="cursor-pointer font-normal"
              >
                {symptom.label}
              </Label>
            </div>
          ))}
        </div>
      </QuestionCard>
    </div>
  );
}

export { ACTIVE_SYMPTOMS };
