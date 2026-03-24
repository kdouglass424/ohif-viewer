import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../database/database.config';
import { StatusModule } from './status/status.module';
import { AccessionModule } from './accession/accession.module';
import { DicomInstanceModule } from './dicom-instance/dicom-instance.module';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), StatusModule, AccessionModule, DicomInstanceModule],
})
export class AppModule {}
