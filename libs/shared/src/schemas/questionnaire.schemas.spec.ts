import { describe, expect, it } from 'vitest';

import { questionnaireFormSchema } from './questionnaire.schemas';

describe('questionnaireFormSchema', () => {
  const validFormData = {
    scalpCondition: 'seborrheic_dermatitis',
    sebumLevel: 'excessive',
    activeSymptoms: ['itching', 'redness'],
    hairStrandCondition: 'natural',
    ingredientTolerance: 'moderate',
  };

  it('accepts valid questionnaire data', () => {
    const result = questionnaireFormSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  it('accepts all valid scalp condition values', () => {
    const conditions = [
      'seborrheic_dermatitis',
      'psoriasis',
      'atopic_dermatitis',
      'severe_dandruff',
      'sensitive_itchy',
    ];

    for (const condition of conditions) {
      const result = questionnaireFormSchema.safeParse({
        ...validFormData,
        scalpCondition: condition,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid sebum level values', () => {
    const levels = ['excessive', 'moderate', 'dry'];

    for (const level of levels) {
      const result = questionnaireFormSchema.safeParse({
        ...validFormData,
        sebumLevel: level,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid active symptom values', () => {
    const symptoms = [
      'itching',
      'redness',
      'yellow_scales',
      'white_flakes',
      'pain_burning',
    ];

    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      activeSymptoms: symptoms,
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid hair strand condition values', () => {
    const conditions = ['natural', 'dyed', 'bleached'];

    for (const condition of conditions) {
      const result = questionnaireFormSchema.safeParse({
        ...validFormData,
        hairStrandCondition: condition,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all valid ingredient tolerance values', () => {
    const tolerances = ['resilient', 'moderate', 'hypoallergenic'];

    for (const tolerance of tolerances) {
      const result = questionnaireFormSchema.safeParse({
        ...validFormData,
        ingredientTolerance: tolerance,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty activeSymptoms array', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      activeSymptoms: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const symptomError = result.error.issues.find(
        (i) => i.path[0] === 'activeSymptoms'
      );
      expect(symptomError?.message).toBe('Please select at least one symptom');
    }
  });

  it('rejects missing scalpCondition', () => {
    const withoutScalp = {
      sebumLevel: validFormData.sebumLevel,
      activeSymptoms: validFormData.activeSymptoms,
      hairStrandCondition: validFormData.hairStrandCondition,
      ingredientTolerance: validFormData.ingredientTolerance,
    };
    const result = questionnaireFormSchema.safeParse(withoutScalp);
    expect(result.success).toBe(false);
  });

  it('rejects missing sebumLevel', () => {
    const withoutSebum = {
      scalpCondition: validFormData.scalpCondition,
      activeSymptoms: validFormData.activeSymptoms,
      hairStrandCondition: validFormData.hairStrandCondition,
      ingredientTolerance: validFormData.ingredientTolerance,
    };
    const result = questionnaireFormSchema.safeParse(withoutSebum);
    expect(result.success).toBe(false);
  });

  it('rejects missing activeSymptoms', () => {
    const withoutSymptoms = {
      scalpCondition: validFormData.scalpCondition,
      sebumLevel: validFormData.sebumLevel,
      hairStrandCondition: validFormData.hairStrandCondition,
      ingredientTolerance: validFormData.ingredientTolerance,
    };
    const result = questionnaireFormSchema.safeParse(withoutSymptoms);
    expect(result.success).toBe(false);
  });

  it('rejects missing hairStrandCondition', () => {
    const withoutHair = {
      scalpCondition: validFormData.scalpCondition,
      sebumLevel: validFormData.sebumLevel,
      activeSymptoms: validFormData.activeSymptoms,
      ingredientTolerance: validFormData.ingredientTolerance,
    };
    const result = questionnaireFormSchema.safeParse(withoutHair);
    expect(result.success).toBe(false);
  });

  it('rejects missing ingredientTolerance', () => {
    const withoutTolerance = {
      scalpCondition: validFormData.scalpCondition,
      sebumLevel: validFormData.sebumLevel,
      activeSymptoms: validFormData.activeSymptoms,
      hairStrandCondition: validFormData.hairStrandCondition,
    };
    const result = questionnaireFormSchema.safeParse(withoutTolerance);
    expect(result.success).toBe(false);
  });

  it('rejects invalid scalp condition value', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      scalpCondition: 'invalid_condition',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sebum level value', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      sebumLevel: 'invalid_level',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid active symptom value in array', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      activeSymptoms: ['itching', 'invalid_symptom'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid hair strand condition value', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      hairStrandCondition: 'invalid_condition',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid ingredient tolerance value', () => {
    const result = questionnaireFormSchema.safeParse({
      ...validFormData,
      ingredientTolerance: 'invalid_tolerance',
    });
    expect(result.success).toBe(false);
  });
});
