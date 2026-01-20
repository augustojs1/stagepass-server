import { z } from 'zod';

import { uploadPresignPayload } from '@/infra/storage/models/upload-pre-sign-payload';

export const galleryImagesPresignDto = z.object({
  gallery_images: z.array(uploadPresignPayload).min(1).max(6),
});

export type GalleryImagesPresignDto = z.infer<typeof galleryImagesPresignDto>;
