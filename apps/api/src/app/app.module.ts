import { Module } from '@nestjs/common';

import { DrizzleModule } from '@/api/database';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
