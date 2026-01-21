import { z } from 'zod';

export const updateEventImagesDto = z.object({
  event_images_key: z.array(z.string().min(1)).min(1).max(6),
});

export type UpdateEventImagesDto = z.infer<typeof updateEventImagesDto>;
