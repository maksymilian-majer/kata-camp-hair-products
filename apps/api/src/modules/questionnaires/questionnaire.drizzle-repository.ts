import type { QuestionnaireProfile } from '@hair-product-scanner/shared';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDB } from '@/api/database/drizzle.module';
import * as schema from '@/api/database/schema';

import type {
  NewQuestionnaire,
  QuestionnaireRepository,
  UpdateQuestionnaire,
} from './questionnaire.repository';

@Injectable()
export class QuestionnaireDrizzleRepository implements QuestionnaireRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDB
  ) {}

  async findByUserId(userId: string): Promise<QuestionnaireProfile | null> {
    const results = await this.db
      .select()
      .from(schema.questionnaires)
      .where(eq(schema.questionnaires.userId, userId))
      .limit(1);

    return results[0] ? this.toQuestionnaireProfile(results[0]) : null;
  }

  async save(questionnaire: NewQuestionnaire): Promise<QuestionnaireProfile> {
    const results = await this.db
      .insert(schema.questionnaires)
      .values({
        userId: questionnaire.userId,
        scalpCondition: questionnaire.scalpCondition,
        sebumLevel: questionnaire.sebumLevel,
        activeSymptoms: questionnaire.activeSymptoms,
        hairStrandCondition: questionnaire.hairStrandCondition,
        ingredientTolerance: questionnaire.ingredientTolerance,
      })
      .returning();

    return this.toQuestionnaireProfile(results[0]);
  }

  async update(
    userId: string,
    data: UpdateQuestionnaire
  ): Promise<QuestionnaireProfile> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.scalpCondition !== undefined) {
      updateData['scalpCondition'] = data.scalpCondition;
    }
    if (data.sebumLevel !== undefined) {
      updateData['sebumLevel'] = data.sebumLevel;
    }
    if (data.activeSymptoms !== undefined) {
      updateData['activeSymptoms'] = data.activeSymptoms;
    }
    if (data.hairStrandCondition !== undefined) {
      updateData['hairStrandCondition'] = data.hairStrandCondition;
    }
    if (data.ingredientTolerance !== undefined) {
      updateData['ingredientTolerance'] = data.ingredientTolerance;
    }

    const results = await this.db
      .update(schema.questionnaires)
      .set(updateData)
      .where(eq(schema.questionnaires.userId, userId))
      .returning();

    return this.toQuestionnaireProfile(results[0]);
  }

  private toQuestionnaireProfile(
    row: schema.QuestionnaireRow
  ): QuestionnaireProfile {
    return {
      id: row.id,
      userId: row.userId,
      scalpCondition: row.scalpCondition,
      sebumLevel: row.sebumLevel,
      activeSymptoms: row.activeSymptoms,
      hairStrandCondition: row.hairStrandCondition,
      ingredientTolerance: row.ingredientTolerance,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
