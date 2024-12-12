import { z } from 'zod';

/**
 * Vantage Mode Method Model.
 *
 * @description Data model for `vantage_mode_method`.
 */
export const VantageModeMethodModel = z.object({
  vantage_mode_method_id: z.number(),
  vantage_mode_id: z.number(),
  method_lookup_id: z.number(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type VantageModeMethodModel = z.infer<typeof VantageModeMethodModel>;

/**
 * Vantage Mode Method Record.
 *
 * @description Data record for `vantage_mode_method`.
 */
export const VantageModeMethodRecord = VantageModeMethodModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type VantageModeMethodRecord = z.infer<typeof VantageModeMethodRecord>;
