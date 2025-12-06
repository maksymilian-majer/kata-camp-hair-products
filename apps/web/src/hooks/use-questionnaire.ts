import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  QuestionnaireProfile,
  SaveQuestionnaireRequest,
} from '@hair-product-scanner/shared';
import {
  getQuestionnaire,
  saveQuestionnaire,
} from '@/web/lib/api/questionnaire';

export const QUESTIONNAIRE_QUERY_KEY = ['questionnaire'] as const;

export function useQuestionnaire() {
  return useQuery({
    queryKey: QUESTIONNAIRE_QUERY_KEY,
    queryFn: getQuestionnaire,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useSaveQuestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveQuestionnaireRequest) => saveQuestionnaire(data),
    onSuccess: (profile) => {
      queryClient.setQueryData<QuestionnaireProfile>(
        QUESTIONNAIRE_QUERY_KEY,
        profile
      );
    },
  });
}
