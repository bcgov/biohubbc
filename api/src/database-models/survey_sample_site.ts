import { z } from 'zod';

/**
 * Survey Sample Site Model.
 *
 * @description Data model for `survey_sample_site`.
 */
export const SurveySampleSiteModel = z.object({
  survey_sample_site_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
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

export type SurveySampleSiteModel = z.infer<typeof SurveySampleSiteModel>;

/**
 * Survey Sample Site Record.
 *
 * @description Data record for `survey_sample_site`.
 */
export const SurveySampleSiteRecord = SurveySampleSiteModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveySampleSiteRecord = z.infer<typeof SurveySampleSiteRecord>;
