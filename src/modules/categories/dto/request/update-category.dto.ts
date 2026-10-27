import { z } from 'zod';

export const updateCategoryDtoSchema = z
  .object({
    name: z.string().min(1).max(50),
  })
  .required();

export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
