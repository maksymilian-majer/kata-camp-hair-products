'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import type {
  QuestionnaireFormData as QuestionnaireFormDataShared,
  QuestionnaireProfile,
} from '@hair-product-scanner/shared';
import { questionnaireFormSchema } from '@hair-product-scanner/shared';
import { toast } from '@hair-product-scanner/ui';
import { useSaveQuestionnaire } from '@/web/hooks/use-questionnaire';

type UseQuestionnaireFormOptions = {
  existingProfile?: QuestionnaireProfile | null;
  onSuccess?: () => void;
};

function getDefaultValues(profile?: QuestionnaireProfile | null) {
  return {
    scalpCondition: profile?.scalpCondition,
    sebumLevel: profile?.sebumLevel,
    activeSymptoms: profile?.activeSymptoms ?? [],
    hairStrandCondition: profile?.hairStrandCondition,
    ingredientTolerance: profile?.ingredientTolerance,
  };
}

function focusFirstErrorField(
  firstField: string,
  firstErrorRef: React.RefObject<string | null>
) {
  if (firstField !== firstErrorRef.current) {
    (firstErrorRef as React.MutableRefObject<string | null>).current =
      firstField;
    const element = document.querySelector(`[data-field="${firstField}"]`);
    if (element) {
      element.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      const focusable = element.querySelector<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }
}

export function useQuestionnaireForm(
  options: UseQuestionnaireFormOptions = {}
) {
  const { existingProfile, onSuccess } = options;
  const router = useRouter();
  const saveQuestionnaire = useSaveQuestionnaire();
  const firstErrorRef = useRef<string | null>(null);

  const form = useForm<QuestionnaireFormDataShared>({
    resolver: zodResolver(questionnaireFormSchema),
    defaultValues: getDefaultValues(existingProfile),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (existingProfile) {
      form.reset(getDefaultValues(existingProfile));
    }
  }, [existingProfile, form]);

  const handleSubmit = useCallback(
    async (data: QuestionnaireFormDataShared) => {
      try {
        await saveQuestionnaire.mutateAsync(data);
        toast.success('Profile saved successfully!');
        onSuccess ? onSuccess() : router.push('/dashboard');
      } catch {
        toast.error('Failed to save profile. Please try again.');
      }
    },
    [saveQuestionnaire, router, onSuccess]
  );

  const onSubmit = useCallback(() => {
    form.handleSubmit(handleSubmit)();
  }, [form, handleSubmit]);

  useEffect(() => {
    const errors = form.formState.errors;
    const errorFields = Object.keys(errors) as Array<keyof typeof errors>;
    if (errorFields.length > 0 && form.formState.isSubmitted) {
      focusFirstErrorField(errorFields[0], firstErrorRef);
    } else {
      firstErrorRef.current = null;
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  const getError = useCallback(
    (field: keyof QuestionnaireFormDataShared): string | undefined =>
      form.formState.errors[field]?.message,
    [form.formState.errors]
  );

  const setValue = useCallback(
    <K extends keyof QuestionnaireFormDataShared>(
      field: K,
      value: QuestionnaireFormDataShared[K]
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(field, value as any, {
        shouldValidate: form.formState.isSubmitted,
      });
    },
    [form]
  );

  const values = form.watch();

  return {
    form,
    onSubmit,
    setValue,
    isSubmitting: saveQuestionnaire.isPending,
    isEditing: !!existingProfile,
    errors: {
      scalpCondition: getError('scalpCondition'),
      sebumLevel: getError('sebumLevel'),
      activeSymptoms: getError('activeSymptoms'),
      hairStrandCondition: getError('hairStrandCondition'),
      ingredientTolerance: getError('ingredientTolerance'),
    },
    values: {
      scalpCondition: values.scalpCondition,
      sebumLevel: values.sebumLevel,
      activeSymptoms: values.activeSymptoms ?? [],
      hairStrandCondition: values.hairStrandCondition,
      ingredientTolerance: values.ingredientTolerance,
    },
  };
}
