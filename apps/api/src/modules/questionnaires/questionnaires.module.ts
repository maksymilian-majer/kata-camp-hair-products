import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/api/database/drizzle.module';
import { AuthModule } from '@/api/modules/auth';

import { PROFILE_CURATOR } from './profile-curator.service';
import { ProfileCuratorImpl } from './profile-curator.service-impl';
import { QuestionnaireDrizzleRepository } from './questionnaire.drizzle-repository';
import { QUESTIONNAIRE_REPOSITORY } from './questionnaire.repository';
import { QuestionnairesController } from './questionnaires.controller';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [QuestionnairesController],
  providers: [
    {
      provide: QUESTIONNAIRE_REPOSITORY,
      useClass: QuestionnaireDrizzleRepository,
    },
    {
      provide: PROFILE_CURATOR,
      useClass: ProfileCuratorImpl,
    },
  ],
  exports: [QUESTIONNAIRE_REPOSITORY, PROFILE_CURATOR],
})
export class QuestionnairesModule {}
