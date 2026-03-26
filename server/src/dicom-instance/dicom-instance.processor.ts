import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { StudyService } from '../study/study.service';
import { config } from '../config';

/**
 * Parse DICOM PN (Person Name) for a pet — extract the given name (component 1).
 * Format: LastName^FirstName^MiddleName^Prefix^Suffix
 * e.g. "Tsiperman^Mark" → "Mark", "white^Kirk" → "Kirk"
 */
function parsePatientName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const given = raw.split('^')[1]?.trim();
  return given || undefined;
}

/**
 * Parse DICOM PN for the responsible person (client/owner) into "Last, First" format.
 * Format: LastName^FirstName^MiddleName^Prefix^Suffix
 * e.g. "Martin^Martin^Jessica^^" → "Martin, Jessica"
 */
function parseClientName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const parts = raw.split('^');
  const last = parts[0]?.trim();
  const first = parts[2]?.trim() || parts[1]?.trim();
  if (last && first) return `${last}, ${first}`;
  return last || first || undefined;
}

@Processor('dicom-instances')
export class DicomInstanceProcessor extends WorkerHost {
  private readonly logger = new Logger(DicomInstanceProcessor.name);

  constructor(private readonly studyService: StudyService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orthancId } = job.data;
    this.logger.log(`Processing instance ${orthancId}`);

    try {
      const [instanceRes, tagsRes] = await Promise.all([
        fetch(`${config.ORTHANC_INTERNAL_URL}/instances/${orthancId}`),
        fetch(`${config.ORTHANC_INTERNAL_URL}/instances/${orthancId}/simplified-tags`),
      ]);
      const instance = await instanceRes.json();
      const tags = await tagsRes.json();

      // Only SR instances carry the full vet patient metadata — skip everything else
      if (tags.Modality !== 'SR') {
        this.logger.log(`Skipping non-SR instance ${orthancId} (${tags.Modality})`);
        return;
      }

      // Navigate instance → series → study to get StudyInstanceUID
      let studyInstanceUid: string | undefined;
      if (instance.ParentSeries) {
        const seriesRes = await fetch(
          `${config.ORTHANC_INTERNAL_URL}/series/${instance.ParentSeries}`
        );
        const series = await seriesRes.json();

        const studyRes = await fetch(
          `${config.ORTHANC_INTERNAL_URL}/studies/${series.ParentStudy}`
        );
        const study = await studyRes.json();
        studyInstanceUid = study.MainDicomTags?.StudyInstanceUID;
      }

      studyInstanceUid = studyInstanceUid ?? job.data.studyInstanceUid;

      if (studyInstanceUid) {
        await this.createStudyFromSrTags(studyInstanceUid, tags);
      }
    } catch (err) {
      this.logger.warn(`Could not fetch/process instance ${orthancId}: ${err}`);
    }

    this.logger.log(`Completed instance ${orthancId}`);
  }

  private async createStudyFromSrTags(
    studyInstanceUid: string,
    tags: Record<string, string>,
  ): Promise<void> {
    try {
      let patientWeight: number | undefined;
      if (tags.PatientWeight) {
        const w = parseFloat(tags.PatientWeight);
        if (!isNaN(w)) patientWeight = w;
      }

      await this.studyService.findOrCreate(studyInstanceUid, {
        patientName: parsePatientName(tags.PatientName),
        patientId: tags.PatientID || undefined,
        patientSex: tags.PatientSex || undefined,
        species: tags.PatientSpeciesDescription || undefined,
        breed: tags.PatientBreedDescription || undefined,
        clientName: parseClientName(tags.ResponsiblePerson),
        patientWeight,
      });
      this.logger.log(`Study record ensured for ${studyInstanceUid}`);
    } catch (err) {
      this.logger.warn(`Could not create study record for ${studyInstanceUid}: ${err}`);
    }
  }
}
