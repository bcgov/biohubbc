import { z } from 'zod';

/**
 * Survey Sample Method Model.
 *
 * @description Data model for `survey_sample_method`.
 */
export const SurveySampleMethodModel = z.object({
  survey_sample_method_id: z.number(),
  survey_sample_site_id: z.number(),
  description: z.string().nullable(),
  method_response_metric_id: z.number(),
  method_technique_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveySampleMethodModel = z.infer<typeof SurveySampleMethodModel>;

/**
 * Survey Sample Method Record.
 *
 * @description Data record for `survey_sample_method`.
 */
export const SurveySampleMethodRecord = SurveySampleMethodModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveySampleMethodRecord = z.infer<typeof SurveySampleMethodRecord>;
