import { z } from 'zod';

export const bannerUploadDtoSchema = z
  .object({
    banner_key: z.string().min(1).max(30),
  })
  .required();

export type BannerrUploadDto = z.infer<typeof bannerUploadDtoSchema>;
