import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/api/database/drizzle.module';

import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';

@Module({
  imports: [DrizzleModule],
  providers: [
    {
      provide: QUESTIONNAIRE_REPOSITORY,
      useClass: QuestionnaireDrizzleRepository,
    },
  ],
  exports: [QUESTIONNAIRE_REPOSITORY],
})
export class QuestionnairesModule {}
