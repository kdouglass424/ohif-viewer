import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DicomInstance } from './dicom-instance.entity';
import { DicomInstanceController } from './dicom-instance.controller';
import { DicomInstanceService } from './dicom-instance.service';
import { DicomInstanceProcessor } from './dicom-instance.processor';

@Module({
  imports: [TypeOrmModule.forFeature([DicomInstance]), BullModule.registerQueue({ name: 'dicom-instances' })],
  controllers: [DicomInstanceController],
  providers: [DicomInstanceService, DicomInstanceProcessor],
  exports: [DicomInstanceService],
})
export class DicomInstanceModule {}
