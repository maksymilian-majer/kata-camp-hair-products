import { delay, http, HttpResponse } from 'msw';

import type {
  GetQuestionnaireResponse,
  QuestionnaireProfile,
  SaveQuestionnaireRequest,
  SaveQuestionnaireResponse,
} from '@hair-product-scanner/shared';

let mockQuestionnaire: QuestionnaireProfile | null = null;

export const questionnaireHandlers = [
  http.get('*/api/questionnaires/me', async ({ request }) => {
    await delay(300);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }

    if (!mockQuestionnaire) {
      return HttpResponse.json(
        { message: 'Questionnaire not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const response: GetQuestionnaireResponse = {
      profile: mockQuestionnaire,
    };

    return HttpResponse.json(response);
  }),

  http.post('*/api/questionnaires', async ({ request }) => {
    await delay(500);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 });
    }

    const body = (await request.json()) as SaveQuestionnaireRequest;

    if (
      !body.scalpCondition ||
      !body.sebumLevel ||
      !body.hairStrandCondition ||
      !body.ingredientTolerance
    ) {
      return HttpResponse.json(
        { message: 'All fields are required', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (!body.activeSymptoms || body.activeSymptoms.length === 0) {
      return HttpResponse.json(
        {
          message: 'Please select at least one symptom',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const isUpdate = mockQuestionnaire !== null;

    mockQuestionnaire = {
      id: mockQuestionnaire?.id || crypto.randomUUID(),
      userId: 'mock-user-id',
      scalpCondition: body.scalpCondition,
      sebumLevel: body.sebumLevel,
      activeSymptoms: body.activeSymptoms,
      hairStrandCondition: body.hairStrandCondition,
      ingredientTolerance: body.ingredientTolerance,
      createdAt: mockQuestionnaire?.createdAt || now,
      updatedAt: now,
    };

    const response: SaveQuestionnaireResponse = {
      profile: mockQuestionnaire,
    };

    return HttpResponse.json(response, { status: isUpdate ? 200 : 201 });
  }),
];

export function resetMockQuestionnaire() {
  mockQuestionnaire = null;
}

export function setMockQuestionnaire(profile: QuestionnaireProfile) {
  mockQuestionnaire = profile;
}
