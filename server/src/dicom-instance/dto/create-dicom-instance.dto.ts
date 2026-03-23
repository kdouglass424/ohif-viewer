import { z } from 'zod';

export const CreateDicomInstanceSchema = z.object({
  orthancId: z.string(),
  sopInstanceUid: z.string().optional(),
  seriesInstanceUid: z.string().optional(),
  studyInstanceUid: z.string().optional(),
  sopClassUid: z.string().optional(),
  s3Key: z.string().optional(),
  modality: z.string().optional(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
});

export type CreateDicomInstanceDto = z.infer<typeof CreateDicomInstanceSchema>;
