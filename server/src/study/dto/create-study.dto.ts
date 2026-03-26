import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateStudySchema = z.object({
  studyInstanceUid: z.string(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  patientSex: z.string().optional(),
  patientDob: z.string().date().optional(),
  patientWeight: z.number().optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  clientName: z.string().optional(),
  clientId: z.string().optional(),
});

export class CreateStudyDto extends createZodDto(CreateStudySchema) {}
