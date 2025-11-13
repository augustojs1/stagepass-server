import { z } from 'zod';

export const createCategoryDto = z
  .object({
    name: z.string().min(1).max(50),
  })
  .required();

export type CreateCategoryDto = z.infer<typeof createCategoryDto>;
