'use client';

import { useCallback } from 'react';
import { Loader2Icon } from 'lucide-react';

import { useQuestionnaire } from '@/web/hooks/use-questionnaire';
import { useQuestionnaireForm } from '@/web/hooks/use-questionnaire-form';

import type { QuestionnaireFormData } from './QuestionnaireForm';
import { QuestionnaireForm } from './QuestionnaireForm';
import { QuestionnairePageHeader } from './QuestionnairePageHeader';

export function QuestionnaireContainer() {
  const { data: existingProfile, isLoading: isLoadingProfile } =
    useQuestionnaire();

  const { values, errors, isSubmitting, onSubmit, setValue, isEditing } =
    useQuestionnaireForm({
      existingProfile,
    });

  const handleValueChange = useCallback(
    <K extends keyof QuestionnaireFormData>(
      field: K,
      value: QuestionnaireFormData[K]
    ) => {
      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setValue(field as any, value as any);
      }
    },
    [setValue]
  );

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <QuestionnairePageHeader
        title={isEditing ? 'Edit Your Profile' : 'Complete Your Profile'}
        description={
          isEditing
            ? 'Update your dermo-safety profile to get the most accurate product recommendations.'
            : 'Answer a few questions about your scalp and hair to get personalized product recommendations.'
        }
      />
      <QuestionnaireForm
        values={values}
        errors={errors}
        isSubmitting={isSubmitting}
        onValueChange={handleValueChange}
        onSubmit={onSubmit}
        submitLabel={isEditing ? 'Update Profile' : 'Save Profile'}
      />
    </div>
  );
}
