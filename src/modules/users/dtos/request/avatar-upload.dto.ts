import { z } from 'zod';

export const avatarUploadDtoSchema = z
  .object({
    avatar_key: z.string().min(1).max(30),
  })
  .required();

export type AvatarUploadDto = z.infer<typeof avatarUploadDtoSchema>;
