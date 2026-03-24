import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log(`Config: ${JSON.stringify(config, null, 2)}`);
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(config.PORT);
}
bootstrap();
