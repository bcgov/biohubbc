import { z } from 'zod';

// TODO: Remove this (duplicate as reference).
export interface IMarking {
  marking_id?: string;
  critter_id: string;
  capture_id: string;
  mortality_id: string;
  taxon_marking_body_location_id: string;
  marking_type_id: string;
  marking_material_id: string;
  primary_colour_id: string;
  secondary_colour_id: string;
  text_colour_id: string;
  identifier: string;
  frequency: number;
  frequency_unit: string;
  order: number;
  comment: string;
  attached_timestamp: string;
  removed_timestamp: string;
}

export const CsvMarkingSchema = z.object({
  marking_id: z.string().uuid(),
  critter_id: z.string().uuid(),
  capture_id: z.string().uuid(),
  body_location: z.string(),
  marking_type: z.string(),
  primary_colour: z.string(),
  secondary_colour: z.string(),
  comment: z.string()
});

export type CsvMarking = z.infer<typeof CsvMarkingSchema>;
