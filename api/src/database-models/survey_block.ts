import { z } from 'zod';

/**
 * Survey Block Model.
 *
 * @description Data model for `survey_block`.
 */
export const SurveyBlockModel = z.object({
  survey_block_id: z.number(),
  survey_id: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  geometry: z.null(),
  geography: z.string(),
  geojson: z.any(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyBlockModel = z.infer<typeof SurveyBlockModel>;

/**
 * Survey Block Record.
 *
 * @description Data record for `survey_block`.
 */
export const SurveyBlockRecord = SurveyBlockModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyBlockRecord = z.infer<typeof SurveyBlockRecord>;
