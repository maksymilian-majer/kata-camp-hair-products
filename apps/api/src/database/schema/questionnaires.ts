import { pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const scalpConditionEnum = pgEnum('scalp_condition', [
  'seborrheic_dermatitis',
  'psoriasis',
  'atopic_dermatitis',
  'severe_dandruff',
  'sensitive_itchy',
]);

export const sebumLevelEnum = pgEnum('sebum_level', [
  'excessive',
  'moderate',
  'dry',
]);

export const activeSymptomEnum = pgEnum('active_symptom', [
  'itching',
  'redness',
  'yellow_scales',
  'white_flakes',
  'pain_burning',
]);

export const hairStrandConditionEnum = pgEnum('hair_strand_condition', [
  'natural',
  'dyed',
  'bleached',
]);

export const ingredientToleranceEnum = pgEnum('ingredient_tolerance', [
  'resilient',
  'moderate',
  'hypoallergenic',
]);

export const questionnaires = pgTable('questionnaires', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  scalpCondition: scalpConditionEnum('scalp_condition').notNull(),
  sebumLevel: sebumLevelEnum('sebum_level').notNull(),
  activeSymptoms: activeSymptomEnum('active_symptoms').array().notNull(),
  hairStrandCondition: hairStrandConditionEnum(
    'hair_strand_condition'
  ).notNull(),
  ingredientTolerance: ingredientToleranceEnum(
    'ingredient_tolerance'
  ).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QuestionnaireRow = typeof questionnaires.$inferSelect;
export type NewQuestionnaireRow = typeof questionnaires.$inferInsert;
