import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DicomInstanceService } from './dicom-instance.service';
import { CreateDicomInstanceSchema } from './dto/create-dicom-instance.dto';
import { StudyService } from '../study/study.service';
import { config } from '../config';

@Processor('dicom-instances')
export class DicomInstanceProcessor extends WorkerHost {
  private readonly logger = new Logger(DicomInstanceProcessor.name);

  constructor(
    private readonly service: DicomInstanceService,
    private readonly studyService: StudyService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orthancId } = job.data;
    this.logger.log(`Processing instance ${orthancId}`);

    let studyInstanceUid: string | undefined;
    let patientName: string | undefined;
    let patientId: string | undefined;
    let patientSex: string | undefined;

    try {
      const res = await fetch(`${config.ORTHANC_INTERNAL_URL}/instances/${orthancId}`);
      const instance = await res.json();
      if (instance.ParentStudy) {
        const studyRes = await fetch(
          `${config.ORTHANC_INTERNAL_URL}/studies/${instance.ParentStudy}`
        );
        const study = await studyRes.json();
        studyInstanceUid = study.MainDicomTags?.StudyInstanceUID;
        patientName = study.PatientMainDicomTags?.PatientName;
        patientId = study.PatientMainDicomTags?.PatientID;
        patientSex = study.PatientMainDicomTags?.PatientSex;
      }
    } catch (err) {
      this.logger.warn(`Could not fetch study metadata for ${orthancId}: ${err}`);
    }

    const dto = CreateDicomInstanceSchema.parse({ ...job.data, studyInstanceUid });
    await this.service.upsert(dto);

    if (studyInstanceUid) {
      try {
        await this.studyService.findOrCreate(studyInstanceUid, {
          patientName,
          patientId,
          patientSex,
        });
        this.logger.log(`Study record ensured for ${studyInstanceUid}`);
      } catch (err) {
        this.logger.warn(`Could not create study record for ${studyInstanceUid}: ${err}`);
      }
    }

    this.logger.log(`Completed instance ${orthancId}`);
  }
}
