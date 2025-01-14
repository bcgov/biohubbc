import { z } from 'zod';

/**
 * Attractant Lookup Model.
 *
 * @description Data model for `attractant_lookup`.
 */
export const AttractantLookupModel = z.object({
  attractant_lookup_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type AttractantLookupModel = z.infer<typeof AttractantLookupModel>;

/**
 * Attractant Lookup Record.
 *
 * @description Data record for `attractant_lookup`.
 */
export const AttractantLookupRecord = AttractantLookupModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type AttractantLookupRecord = z.infer<typeof AttractantLookupRecord>;
