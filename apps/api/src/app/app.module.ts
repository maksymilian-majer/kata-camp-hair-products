import { Module } from '@nestjs/common';

import { DrizzleModule } from '../database';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DrizzleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
