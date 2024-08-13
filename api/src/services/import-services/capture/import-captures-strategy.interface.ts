import { z } from 'zod';

/**
 * Zod Csv Capture schema
 *
 */
export const CsvCaptureSchema = z
  .object({
    capture_id: z.string({ required_error: 'Capture exists using same date and time' }).uuid(),
    critter_id: z.string({ required_error: 'Unable to map alias to Critter ID.' }).uuid(),
    capture_location_id: z.string().uuid(),
    capture_date: z.string().date(),
    capture_time: z.string().time().optional(),
    capture_latitude: z.number(),
    capture_longitude: z.number(),
    release_location_id: z.string().uuid().optional(),
    release_date: z.string().date().optional(),
    release_time: z.string().time().optional(),
    release_latitude: z.number().optional(),
    release_longitude: z.number().optional(),
    capture_comment: z.string().optional(),
    release_comment: z.string().optional()
  })
  .refine((schema) => {
    const hasReleaseLatLng = schema.release_latitude && schema.release_longitude;
    return hasReleaseLatLng || !hasReleaseLatLng;
  }, 'Both release latitude and longitude are required if one is provided.');

/**
 * A validated CSV Capture object
 *
 */
export type CsvCapture = z.infer<typeof CsvCaptureSchema>;

/**
 * Partial CSV Capture object with defined `critter_id`
 *
 */
export type PartialCsvCapture = Partial<CsvCapture> & { critter_id: string };
