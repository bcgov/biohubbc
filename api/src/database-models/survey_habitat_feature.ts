import { z } from 'zod';

/**
 * Survey Habitat Feature Model.
 *
 * @description Data model for `survey_habitat_feature`.
 */
export const SurveyHabitatFeatureModel = z.object({
  survey_habitat_feature_id: z.number(),
  survey_id: z.number(),
  habitat_feature_type_id: z.number(),
  count: z.number(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  observed_date: z.string().nullable(),
  observed_time: z.string().nullable(),
  survey_sample_period_id: z.number().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyHabitatFeatureModel = z.infer<typeof SurveyHabitatFeatureModel>;

/**
 * Survey Habitat Feature Record.
 *
 * @description Data record for `survey_habitat_feature`.
 */
export const SurveyHabitatFeatureRecord = SurveyHabitatFeatureModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyHabitatFeatureRecord = z.infer<typeof SurveyHabitatFeatureRecord>;
