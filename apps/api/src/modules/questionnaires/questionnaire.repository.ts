import type { QuestionnaireProfile } from '@hair-product-scanner/shared';

export type NewQuestionnaire = Omit<
  QuestionnaireProfile,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateQuestionnaire = Partial<
  Omit<QuestionnaireProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export interface QuestionnaireRepository {
  findByUserId(userId: string): Promise<QuestionnaireProfile | null>;
  save(questionnaire: NewQuestionnaire): Promise<QuestionnaireProfile>;
  update(
    userId: string,
    data: UpdateQuestionnaire
  ): Promise<QuestionnaireProfile>;
}

export const QUESTIONNAIRE_REPOSITORY = Symbol('QUESTIONNAIRE_REPOSITORY');
