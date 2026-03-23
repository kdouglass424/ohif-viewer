import { z } from 'zod';
import { AccessionStatus } from './update-accession-status.dto';

export const WorklistItemSchema = z.object({
  id: z.string().uuid(),
  accessionNumber: z.string(),
  status: AccessionStatus,
  submittedAt: z.string().datetime(),
  studyInstanceUid: z.string().nullable(),
  patientName: z.string().nullable(),
  species: z.string().nullable(),
  breed: z.string().nullable(),
  clientName: z.string().nullable(),
});

export type WorklistItemDto = z.infer<typeof WorklistItemSchema>;
