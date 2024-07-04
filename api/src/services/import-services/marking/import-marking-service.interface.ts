import { z } from 'zod';

/**
 * Zod Csv Marking schema
 *
 */
export const CsvMarkingSchema = z.object({
  critter_id: z.string().uuid(),
  capture_date: z.string(),
  capture_time: z.string().optional(),
  marking_position: z.string().optional(),
  marking_type: z.string().optional(),
  identifier: z.string().optional(),
  primary_colour: z.string(),
  secondary_colour: z.string(),
  comment: z.string()
});

export type CsvMarking = z.infer<typeof CsvMarkingSchema>;

export type PartialCsvMarking = Partial<CsvMarking> & { critter_id: string };
