import { z } from 'zod';

/**
 * Survey Stratum Model.
 *
 * @description Data model for `survey_stratum`.
 */
export const SurveyStratumModel = z.object({
  survey_stratum_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyStratumModel = z.infer<typeof SurveyStratumModel>;

/**
 * Survey Stratum Record.
 *
 * @description Data record for `survey_stratum`.
 */
export const SurveyStratumRecord = SurveyStratumModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyStratumRecord = z.infer<typeof SurveyStratumRecord>;
