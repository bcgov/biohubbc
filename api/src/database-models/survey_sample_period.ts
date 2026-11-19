import { z } from 'zod';

/**
 * Survey Sample Period Model.
 *
 * @description Data model for `survey_sample_period`.
 */
export const SurveySamplePeriodModel = z.object({
  survey_sample_period_id: z.number(),
  survey_id: z.number(),
  survey_sample_site_id: z.number().nullable(),
  method_technique_id: z.number().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  comment: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveySamplePeriodModel = z.infer<typeof SurveySamplePeriodModel>;

/**
 * Survey Sample Period Record.
 *
 * @description Data record for `survey_sample_period`.
 */
export const SurveySamplePeriodRecord = SurveySamplePeriodModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveySamplePeriodRecord = z.infer<typeof SurveySamplePeriodRecord>;
