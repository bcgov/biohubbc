import { z } from 'zod';

/**
 * Habitat Feature Qualitative Definition Option Model.
 *
 * @description Data model for `habitat_feature_qualitative_definition_option`.
 */
export const HabitatFeatureQualitativeDefinitionOptionModel = z.object({
  habitat_feature_qualitative_definition_option_id: z.string().uuid(),
  habitat_feature_qualitative_definition_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type HabitatFeatureQualitativeDefinitionOptionModel = z.infer<
  typeof HabitatFeatureQualitativeDefinitionOptionModel
>;

/**
 * Habitat Feature Qualitative Definition Option Record.
 *
 * @description Data record for `habitat_feature_qualitative_definition_option`.
 */
export const HabitatFeatureQualitativeDefinitionOptionRecord = HabitatFeatureQualitativeDefinitionOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureQualitativeDefinitionOptionRecord = z.infer<
  typeof HabitatFeatureQualitativeDefinitionOptionRecord
>;
