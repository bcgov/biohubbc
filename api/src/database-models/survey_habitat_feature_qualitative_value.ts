import { z } from 'zod';

/**
 * Survey Habitat Feature Qualitative Value Model.
 *
 * @description Data model for `survey_habitat_feature_qualitative_value`.
 */
export const SurveyHabitatFeatureQualitativeValueModel = z.object({
  survey_habitat_feature_qualitative_value_id: z.number(),
  survey_habitat_feature_id: z.number(),
  habitat_feature_qualitative_definition_id: z.string().uuid(),
  habitat_feature_qualitative_definition_option_id: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyHabitatFeatureQualitativeValueModel = z.infer<typeof SurveyHabitatFeatureQualitativeValueModel>;

/**
 * Survey Habitat Feature Qualitative Value Record.
 *
 * @description Data record for `survey_habitat_feature_qualitative_value`.
 */
export const SurveyHabitatFeatureQualitativeValueRecord = SurveyHabitatFeatureQualitativeValueModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyHabitatFeatureQualitativeValueRecord = z.infer<typeof SurveyHabitatFeatureQualitativeValueRecord>;
