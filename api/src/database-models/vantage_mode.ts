import { z } from 'zod';

/**
 * Vantage Mode Model.
 *
 * @description Data model for `vantage_mode`.
 */
export const VantageModeModel = z.object({
  vantage_mode_id: z.number(),
  vantage_mode_category_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type VantageModeModel = z.infer<typeof VantageModeModel>;

/**
 * Vantage Mode Record.
 *
 * @description Data record for `vantage_mode`.
 */
export const VantageModeRecord = VantageModeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type VantageModeRecord = z.infer<typeof VantageModeRecord>;
