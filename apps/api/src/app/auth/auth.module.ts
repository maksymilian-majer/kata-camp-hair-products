import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { DrizzleModule } from '@/api/database/drizzle.module';

import { AUTHENTICATOR } from './authenticator.service';
import { AuthenticatorImpl } from './authenticator.service-impl';
import { UserDrizzleRepository } from './user.drizzle-repository';
import { USER_REPOSITORY } from './user.repository';

@Module({
  imports: [
    DrizzleModule,
    JwtModule.register({
      secret:
        process.env['JWT_SECRET'] || 'development-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserDrizzleRepository,
    },
    {
      provide: AUTHENTICATOR,
      useClass: AuthenticatorImpl,
    },
  ],
  exports: [USER_REPOSITORY, AUTHENTICATOR],
})
export class AuthModule {}
