import type {
  QuestionnaireFormData,
  QuestionnaireProfile,
} from '@hair-product-scanner/shared';
import { Inject, Injectable } from '@nestjs/common';

import { ValidationException } from '@/api/shared/exceptions';

import type { ProfileCurator } from './profile-curator.service';
import {
  QUESTIONNAIRE_REPOSITORY,
  type QuestionnaireRepository,
} from './questionnaire.repository';

@Injectable()
export class ProfileCuratorImpl implements ProfileCurator {
  constructor(
    @Inject(QUESTIONNAIRE_REPOSITORY)
    private readonly repository: QuestionnaireRepository
  ) {}

  async getProfile(userId: string): Promise<QuestionnaireProfile | null> {
    return this.repository.findByUserId(userId);
  }

  async saveProfile(
    userId: string,
    data: QuestionnaireFormData
  ): Promise<QuestionnaireProfile> {
    this.validateInput(data);

    const existingProfile = await this.repository.findByUserId(userId);

    if (existingProfile) {
      return this.repository.update(userId, data);
    }

    return this.repository.save({
      userId,
      ...data,
    });
  }

  private validateInput(data: QuestionnaireFormData): void {
    if (!data.activeSymptoms || data.activeSymptoms.length === 0) {
      throw ValidationException.invalidInput(
        'Please select at least one symptom'
      );
    }
  }
}
