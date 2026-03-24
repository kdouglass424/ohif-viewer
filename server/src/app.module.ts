import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { databaseConfig } from '../database/database.config';
import { StatusModule } from './status/status.module';
import { AccessionModule } from './accession/accession.module';
import { DicomInstanceModule } from './dicom-instance/dicom-instance.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), StatusModule, AccessionModule, DicomInstanceModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor }],
})
export class AppModule {}
