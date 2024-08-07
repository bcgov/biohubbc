import { z } from 'zod';

export const getCsvMarkingSchema = () => {
  return z.object({
    critter_id: z.string({ required_error: 'Unable to find matching survey critter with alias' }).uuid(),
    capture_id: z.string({ required_error: 'Unable to find matching capture with date and time' }).uuid(),
    body_location: z.string(),
    marking_type: z.string().optional(),
    identifier: z.string().optional(),
    primary_colour: z.string().optional(),
    secondary_colour: z.string().optional(),
    comment: z.string().optional()
  });
};

export const CsvMarkingSchema = z.object({
  critter_id: z.string({ required_error: 'Unable to find matching survey critter with alias' }).uuid(),
  capture_id: z.string({ required_error: 'Unable to find matching capture with date and time' }).uuid(),
  body_location: z.string(),
  marking_type: z.string().optional(),
  identifier: z.string().optional(),
  primary_colour: z.string().optional(),
  secondary_colour: z.string().optional(),
  comment: z.string().optional()
});

/**
 * A validated CSV Marking object
 *
 */
export type CsvMarking = z.infer<typeof CsvMarkingSchema>;
