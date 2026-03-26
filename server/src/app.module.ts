import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { databaseConfig } from '../database/database.config';
import { config } from './config';
import { StatusModule } from './status/status.module';
import { StudyModule } from './study/study.module';
import { DicomInstanceModule } from './dicom-instance/dicom-instance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    BullModule.forRoot({
      connection: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
    }),
    StatusModule,
    StudyModule,
    DicomInstanceModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ],
})
export class AppModule {}
