import { z } from 'zod';

/**
 * Vantage Model.
 *
 * @description Data model for `vantage`.
 */
export const VantageModel = z.object({
  vantage_id: z.number(),
  vantage_category_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type VantageModel = z.infer<typeof VantageModel>;

/**
 * Vantage Record.
 *
 * @description Data record for `vantage`.
 */
export const VantageRecord = VantageModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type VantageRecord = z.infer<typeof VantageRecord>;
