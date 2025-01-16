import { z } from 'zod';

/**
 * Vantage category model.
 *
 * @description Data model for `vantage_category`.
 */
export const VantageCategoryModel = z.object({
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

export type VantageCategoryModel = z.infer<typeof VantageCategoryModel>;

/**
 * Vantage Category Record.
 *
 * @description Data record for `vantage_category`.
 */
export const VantageCategory = VantageCategoryModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type VantageCategory = z.infer<typeof VantageCategory>;
