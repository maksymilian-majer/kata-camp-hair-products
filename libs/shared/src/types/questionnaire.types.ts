export type ScalpCondition =
  | 'seborrheic_dermatitis'
  | 'psoriasis'
  | 'atopic_dermatitis'
  | 'severe_dandruff'
  | 'sensitive_itchy';

export type SebumLevel = 'excessive' | 'moderate' | 'dry';

export type ActiveSymptom =
  | 'itching'
  | 'redness'
  | 'yellow_scales'
  | 'white_flakes'
  | 'pain_burning';

export type HairStrandCondition = 'natural' | 'dyed' | 'bleached';

export type IngredientTolerance = 'resilient' | 'moderate' | 'hypoallergenic';

export type QuestionnaireProfile = {
  id: string;
  userId: string;
  scalpCondition: ScalpCondition;
  sebumLevel: SebumLevel;
  activeSymptoms: ActiveSymptom[];
  hairStrandCondition: HairStrandCondition;
  ingredientTolerance: IngredientTolerance;
  createdAt: string;
  updatedAt: string;
};

export type QuestionnaireFormData = {
  scalpCondition: ScalpCondition;
  sebumLevel: SebumLevel;
  activeSymptoms: ActiveSymptom[];
  hairStrandCondition: HairStrandCondition;
  ingredientTolerance: IngredientTolerance;
};

export type SaveQuestionnaireRequest = QuestionnaireFormData;

export type SaveQuestionnaireResponse = {
  profile: QuestionnaireProfile;
};

export type GetQuestionnaireResponse = {
  profile: QuestionnaireProfile;
};
