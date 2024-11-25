import { z } from 'zod';

/**
 * Survey Sample Stratum Model.
 *
 * @description Data model for `survey_sample_stratum`.
 */
export const SurveySampleStratumModel = z.object({
  survey_sample_stratum_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_stratum_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveySampleStratumModel = z.infer<typeof SurveySampleStratumModel>;

/**
 * Survey Sample Stratum Record.
 *
 * @description Data record for `survey_sample_stratum`.
 */
export const SurveySampleStratumRecord = SurveySampleStratumModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveySampleStratumRecord = z.infer<typeof SurveySampleStratumRecord>;
