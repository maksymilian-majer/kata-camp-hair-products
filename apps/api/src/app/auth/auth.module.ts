import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/api/database/drizzle.module';

import { UserDrizzleRepository } from './user.drizzle-repository';
import { USER_REPOSITORY } from './user.repository';

@Module({
  imports: [DrizzleModule],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserDrizzleRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class AuthModule {}
