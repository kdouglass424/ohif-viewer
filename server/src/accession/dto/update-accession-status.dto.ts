import { z } from 'zod';

export const AccessionStatus = z.enum(['pending', 'in_progress', 'done']);
export type AccessionStatus = z.infer<typeof AccessionStatus>;

export const UpdateAccessionStatusSchema = z.object({
  status: AccessionStatus,
});

export type UpdateAccessionStatusDto = z.infer<typeof UpdateAccessionStatusSchema>;
