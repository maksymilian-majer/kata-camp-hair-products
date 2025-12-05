'use client';

import { useState } from 'react';

import type { QuestionnaireFormData } from '@/web/components/questionnaire';
import {
  QuestionnaireForm,
  QuestionnairePageHeader,
} from '@/web/components/questionnaire';

const initialValues: QuestionnaireFormData = {
  scalpCondition: undefined,
  sebumLevel: undefined,
  activeSymptoms: [],
  hairStrandCondition: undefined,
  ingredientTolerance: undefined,
};

export default function QuestionnairePage() {
  const [values, setValues] = useState<QuestionnaireFormData>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValueChange = <K extends keyof QuestionnaireFormData>(
    field: K,
    value: QuestionnaireFormData[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <QuestionnairePageHeader />
      <QuestionnaireForm
        values={values}
        isSubmitting={isSubmitting}
        onValueChange={handleValueChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
