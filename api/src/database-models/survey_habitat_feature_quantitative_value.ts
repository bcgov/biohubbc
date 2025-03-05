import { z } from 'zod';

/**
 * Survey Habitat Feature Quantitative Value Model.
 *
 * @description Data model for `survey_habitat_feature_quantitative_value`.
 */
export const SurveyHabitatFeatureQuantitativeValueModel = z.object({
  survey_habitat_feature_quantitative_value_id: z.number(),
  survey_habitat_feature_id: z.number(),
  habitat_feature_quantitative_definition_id: z.string().uuid(),
  value: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyHabitatFeatureQuantitativeValueModel = z.infer<typeof SurveyHabitatFeatureQuantitativeValueModel>;

/**
 * Survey Habitat Feature Quantitative Value Record.
 *
 * @description Data record for `survey_habitat_feature_quantitative_value`.
 */
export const SurveyHabitatFeatureQuantitativeValueRecord = SurveyHabitatFeatureQuantitativeValueModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyHabitatFeatureQuantitativeValueRecord = z.infer<typeof SurveyHabitatFeatureQuantitativeValueRecord>;
