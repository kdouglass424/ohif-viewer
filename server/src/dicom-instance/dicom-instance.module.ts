import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DicomInstance } from './dicom-instance.entity';
import { DicomInstanceController } from './dicom-instance.controller';
import { DicomInstanceService } from './dicom-instance.service';

@Module({
  imports: [TypeOrmModule.forFeature([DicomInstance])],
  controllers: [DicomInstanceController],
  providers: [DicomInstanceService],
  exports: [DicomInstanceService],
})
export class DicomInstanceModule {}
