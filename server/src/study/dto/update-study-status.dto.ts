import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StudyStatusEnum = z.enum(['pending', 'reviewed', 'submitted']);
export type StudyStatusEnum = z.infer<typeof StudyStatusEnum>;

export const UpdateStudyStatusSchema = z.object({
  status: StudyStatusEnum,
});

export class UpdateStudyStatusDto extends createZodDto(UpdateStudyStatusSchema) {}
