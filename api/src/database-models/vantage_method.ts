import { z } from 'zod';

/**
 * Vantage Method Model.
 *
 * @description Data model for `vantage_method`.
 */
export const VantageMethodModel = z.object({
  vantage_method_id: z.number(),
  vantage_id: z.number(),
  method_lookup_id: z.number(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type VantageMethodModel = z.infer<typeof VantageMethodModel>;

/**
 * Vantage Method Record.
 *
 * @description Data record for `vantage_method`.
 */
export const VantageMethodRecord = VantageMethodModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type VantageMethodRecord = z.infer<typeof VantageMethodRecord>;
