import type {
  QuestionnaireFormData,
  QuestionnaireProfile,
} from '@hair-product-scanner/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationException } from '@/api/shared/exceptions';

import { ProfileCuratorImpl } from './profile-curator.service-impl';
import type { QuestionnaireRepository } from './questionnaire.repository';

describe('ProfileCuratorImpl', () => {
  let profileCurator: ProfileCuratorImpl;
  let mockRepository: QuestionnaireRepository;

  const mockProfile: QuestionnaireProfile = {
    id: 'questionnaire-1',
    userId: 'user-1',
    scalpCondition: 'seborrheic_dermatitis',
    sebumLevel: 'excessive',
    activeSymptoms: ['itching', 'yellow_scales'],
    hairStrandCondition: 'natural',
    ingredientTolerance: 'moderate',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  };

  const validFormData: QuestionnaireFormData = {
    scalpCondition: 'seborrheic_dermatitis',
    sebumLevel: 'excessive',
    activeSymptoms: ['itching', 'yellow_scales'],
    hairStrandCondition: 'natural',
    ingredientTolerance: 'moderate',
  };

  beforeEach(() => {
    mockRepository = {
      findByUserId: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    profileCurator = new ProfileCuratorImpl(mockRepository);
  });

  describe('getProfile', () => {
    it('should return questionnaire profile when profile exists', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockProfile);

      const result = await profileCurator.getProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('should return null when no profile exists', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);

      const result = await profileCurator.getProfile('user-1');

      expect(result).toBeNull();
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });

  describe('saveProfile', () => {
    it('should create new profile when none exists', async () => {
      vi.mocked(mockRepository.findByUserId).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue(mockProfile);

      const result = await profileCurator.saveProfile('user-1', validFormData);

      expect(result).toEqual(mockProfile);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepository.save).toHaveBeenCalledWith({
        userId: 'user-1',
        ...validFormData,
      });
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should update existing profile when one exists', async () => {
      const updatedProfile: QuestionnaireProfile = {
        ...mockProfile,
        scalpCondition: 'psoriasis',
        updatedAt: '2024-01-16T10:00:00.000Z',
      };
      const updatedFormData: QuestionnaireFormData = {
        ...validFormData,
        scalpCondition: 'psoriasis',
      };

      vi.mocked(mockRepository.findByUserId).mockResolvedValue(mockProfile);
      vi.mocked(mockRepository.update).mockResolvedValue(updatedProfile);

      const result = await profileCurator.saveProfile(
        'user-1',
        updatedFormData
      );

      expect(result).toEqual(updatedProfile);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(mockRepository.update).toHaveBeenCalledWith(
        'user-1',
        updatedFormData
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ValidationException when activeSymptoms is empty', async () => {
      const invalidFormData: QuestionnaireFormData = {
        ...validFormData,
        activeSymptoms: [],
      };

      await expect(
        profileCurator.saveProfile('user-1', invalidFormData)
      ).rejects.toThrow(ValidationException);

      await expect(
        profileCurator.saveProfile('user-1', invalidFormData)
      ).rejects.toThrow('Please select at least one symptom');

      expect(mockRepository.findByUserId).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });
});
