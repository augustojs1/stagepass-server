import { z } from 'zod';

export const bannerUploadDtoSchema = z
  .object({
    banner_key: z.string().min(1),
  })
  .required();

export type BannerrUploadDto = z.infer<typeof bannerUploadDtoSchema>;
