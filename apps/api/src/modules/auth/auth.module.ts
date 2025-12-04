import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DrizzleModule } from '@/api/database/drizzle.module';

import { AuthController } from './auth.controller';
import { AUTHENTICATOR } from './authenticator.service';
import { AuthenticatorImpl } from './authenticator.service-impl';
import { JwtStrategy } from './jwt.strategy';
import { UserDrizzleRepository } from './user.drizzle-repository';
import { USER_REPOSITORY } from './user.repository';

@Module({
  imports: [
    DrizzleModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret:
          process.env['JWT_SECRET'] ||
          'development-secret-change-in-production',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserDrizzleRepository,
    },
    {
      provide: AUTHENTICATOR,
      useFactory: (
        userRepository: UserDrizzleRepository,
        jwtService: JwtService
      ) => {
        return new AuthenticatorImpl(userRepository, jwtService);
      },
      inject: [USER_REPOSITORY, JwtService],
    },
    JwtStrategy,
  ],
  exports: [USER_REPOSITORY, AUTHENTICATOR, JwtModule],
})
export class AuthModule {}
