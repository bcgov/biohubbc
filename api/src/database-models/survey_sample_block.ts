import { z } from 'zod';

/**
 * Survey Sample Block Model.
 *
 * @description Data model for `survey_sample_block`.
 */
export const SurveySampleBlockModel = z.object({
  survey_sample_block_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_block_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveySampleBlockModel = z.infer<typeof SurveySampleBlockModel>;

/**
 * Survey Sample Block Record.
 *
 * @description Data record for `survey_sample_block`.
 */
export const SurveySampleBlockRecord = SurveySampleBlockModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveySampleBlockRecord = z.infer<typeof SurveySampleBlockRecord>;
