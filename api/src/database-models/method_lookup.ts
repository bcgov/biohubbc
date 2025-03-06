import { z } from 'zod';

/**
 * Method Lookup Model.
 *
 * @description Data model for `method_lookup`.
 */
export const MethodLookupModel = z.object({
  method_lookup_id: z.number(),
  name: z.string(),
  record_effective_date: z.string(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodLookupModel = z.infer<typeof MethodLookupModel>;

/**
 * Method Lookup Record.
 *
 * @description Data record for `method_lookup`.
 */
export const MethodLookupRecord = MethodLookupModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodLookupRecord = z.infer<typeof MethodLookupRecord>;
