import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './shared/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: ['http://localhost:3000'],
  });

  const port = process.env.API_PORT || process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
