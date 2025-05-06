import { z } from 'zod';

/**
 * Survey Filter Model.
 *
 * @description Data model for `survey_stratum`.
 */
export const SurveyFilterModel = z.object({
  survey_filter_id: z.number(),
  system_user_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  conditions: z.any(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyFilterModel = z.infer<typeof SurveyFilterModel>;

/**
 * Survey Filter Record.
 *
 * @description Data record for `survey_stratum`.
 */
export const SurveyFilterRecord = SurveyFilterModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyFilterRecord = z.infer<typeof SurveyFilterRecord>;
