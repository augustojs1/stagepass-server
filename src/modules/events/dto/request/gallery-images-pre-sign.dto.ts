import { z } from 'zod';

import { uploadPresignPayloadSchema } from '@/infra/storage/models/upload-pre-sign-payload';

export const galleryImagesPresignDtoSchema = z.object({
  gallery_images: z.array(uploadPresignPayloadSchema).min(1).max(6),
});

export type GalleryImagesPresignDto = z.infer<
  typeof galleryImagesPresignDtoSchema
>;
