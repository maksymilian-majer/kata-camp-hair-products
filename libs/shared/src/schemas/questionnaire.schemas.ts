import { z } from 'zod';

export const scalpConditionSchema = z.enum([
  'seborrheic_dermatitis',
  'psoriasis',
  'atopic_dermatitis',
  'severe_dandruff',
  'sensitive_itchy',
]);

export const sebumLevelSchema = z.enum(['excessive', 'moderate', 'dry']);

export const activeSymptomSchema = z.enum([
  'itching',
  'redness',
  'yellow_scales',
  'white_flakes',
  'pain_burning',
]);

export const hairStrandConditionSchema = z.enum([
  'natural',
  'dyed',
  'bleached',
]);

export const ingredientToleranceSchema = z.enum([
  'resilient',
  'moderate',
  'hypoallergenic',
]);

export const questionnaireFormSchema = z.object({
  scalpCondition: scalpConditionSchema,
  sebumLevel: sebumLevelSchema,
  activeSymptoms: z
    .array(activeSymptomSchema)
    .min(1, 'Please select at least one symptom'),
  hairStrandCondition: hairStrandConditionSchema,
  ingredientTolerance: ingredientToleranceSchema,
});

export const questionnaireProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  scalpCondition: scalpConditionSchema,
  sebumLevel: sebumLevelSchema,
  activeSymptoms: z.array(activeSymptomSchema),
  hairStrandCondition: hairStrandConditionSchema,
  ingredientTolerance: ingredientToleranceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const saveQuestionnaireRequestSchema = questionnaireFormSchema;

export const saveQuestionnaireResponseSchema = z.object({
  profile: questionnaireProfileSchema,
});

export const getQuestionnaireResponseSchema = z.object({
  profile: questionnaireProfileSchema,
});

export type QuestionnaireFormDataSchema = z.infer<
  typeof questionnaireFormSchema
>;
export type QuestionnaireProfileSchema = z.infer<
  typeof questionnaireProfileSchema
>;
