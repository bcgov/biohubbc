import { z } from 'zod';

/**
 * Habitat Feature Type Qualitative Option Model.
 *
 * @description Data model for `habitat_feature_type_qualitative_option`.
 */
export const HabitatFeatureTypeQualitativeOptionModel = z.object({
  habitat_feature_type_qualitative_option_id: z.number(),
  habitat_feature_qualitative_definition_id: z.string().uuid(),
  habitat_feature_type_id: z.number(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type HabitatFeatureTypeQualitativeOptionModel = z.infer<typeof HabitatFeatureTypeQualitativeOptionModel>;

/**
 * Habitat Feature Type Qualitative Option Record.
 *
 * @description Data record for `habitat_feature_type_qualitative_option`.
 */
export const HabitatFeatureTypeQualitativeOptionRecord = HabitatFeatureTypeQualitativeOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureTypeQualitativeOptionRecord = z.infer<typeof HabitatFeatureTypeQualitativeOptionRecord>;
