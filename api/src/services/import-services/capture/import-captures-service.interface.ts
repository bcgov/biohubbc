import { z } from 'zod';

/**
 * Zod Csv Capture schema
 *
 */
export const CsvCaptureSchema = z.object({
  critter_id: z.string().uuid(),
  capture_date: z.string(),
  capture_time: z.string().optional(),
  capture_latitude: z.number(),
  capture_longitude: z.number(),
  release_date: z.string().optional(),
  release_time: z.string().optional(),
  release_latitude: z.number().optional(),
  release_longitude: z.number().optional(),
  capture_comment: z.string().optional()
});

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
