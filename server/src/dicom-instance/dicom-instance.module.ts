import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DicomInstanceProcessor } from './dicom-instance.processor';
import { StudyModule } from '../study/study.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'dicom-instances' }),
    StudyModule,
  ],
  providers: [DicomInstanceProcessor],
})
export class DicomInstanceModule {}
