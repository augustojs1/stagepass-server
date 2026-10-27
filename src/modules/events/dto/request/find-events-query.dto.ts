import { z } from 'zod';

import { paginationQuerySchema } from '@/modules/shared/pagination/dto';

const booleanQuerySchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const optionalNumberFromQuery = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return value;
}, z.coerce.number().optional());

export const findEventsQuerySchema = paginationQuerySchema
  .extend({
    search: z.string().trim().min(1).max(100).optional(),

    category_ids: z
      .string()
      .transform((value) =>
        value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().uuid()).max(20))
      .optional(),

    is_free: booleanQuerySchema.optional(),

    latitude: optionalNumberFromQuery.pipe(
      z.number().min(-90).max(90).optional(),
    ),

    longitude: optionalNumberFromQuery.pipe(
      z.number().min(-180).max(180).optional(),
    ),

    radius_km: optionalNumberFromQuery.pipe(
      z.number().positive().max(500).optional(),
    ),
  })
  .superRefine((data, context) => {
    const coordinates = [data.latitude, data.longitude, data.radius_km];

    const providedCoordinates = coordinates.filter(
      (value) => value !== undefined,
    );

    if (
      providedCoordinates.length > 0 &&
      providedCoordinates.length !== coordinates.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'latitude, longitude and radius_km must be provided together.',
        path: ['latitude'],
      });
    }
  });

export type FindEventsQueryDto = z.infer<typeof findEventsQuerySchema>;
