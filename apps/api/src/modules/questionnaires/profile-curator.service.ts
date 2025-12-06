import type {
  QuestionnaireFormData,
  QuestionnaireProfile,
} from '@hair-product-scanner/shared';

export interface ProfileCurator {
  getProfile(userId: string): Promise<QuestionnaireProfile | null>;
  saveProfile(
    userId: string,
    data: QuestionnaireFormData
  ): Promise<QuestionnaireProfile>;
}

export const PROFILE_CURATOR = Symbol('PROFILE_CURATOR');
