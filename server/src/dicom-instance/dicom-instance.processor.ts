import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DicomInstanceService } from './dicom-instance.service';
import { CreateDicomInstanceSchema } from './dto/create-dicom-instance.dto';
import { config } from '../config';

@Processor('dicom-instances')
export class DicomInstanceProcessor extends WorkerHost {
  private readonly logger = new Logger(DicomInstanceProcessor.name);

  constructor(private readonly service: DicomInstanceService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orthancId } = job.data;
    this.logger.log(`Processing instance ${orthancId}`);

    let accessionNumber: string | undefined;
    try {
      const res = await fetch(`${config.ORTHANC_INTERNAL_URL}/instances/${orthancId}`);
      const instance = await res.json();
      if (instance.ParentStudy) {
        const studyRes = await fetch(
          `${config.ORTHANC_INTERNAL_URL}/studies/${instance.ParentStudy}`
        );
        const study = await studyRes.json();
        accessionNumber = study.MainDicomTags?.AccessionNumber;
      }
    } catch (err) {
      this.logger.warn(`Could not fetch AccessionNumber for ${orthancId}: ${err}`);
    }

    const dto = CreateDicomInstanceSchema.parse({ ...job.data, accessionNumber });
    await this.service.upsert(dto);
    this.logger.log(`Completed instance ${orthancId}`);
  }
}
