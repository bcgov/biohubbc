import { z } from 'zod';

/**
 * Habitat Feature Type Quantitative Option Model.
 *
 * @description Data model for `habitat_feature_type_quantitative_option`.
 */
export const HabitatFeatureTypeQuantitativeOptionModel = z.object({
  habitat_feature_type_quantitative_option_id: z.number(),
  habitat_feature_quantitative_definition_id: z.string().uuid(),
  habitat_feature_type_id: z.number(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type HabitatFeatureTypeQuantitativeOptionModel = z.infer<typeof HabitatFeatureTypeQuantitativeOptionModel>;

/**
 * Habitat Feature Type Quantitative Option Record.
 *
 * @description Data record for `habitat_feature_type_quantitative_option`.
 */
export const HabitatFeatureTypeQuantitativeOptionRecord = HabitatFeatureTypeQuantitativeOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureTypeQuantitativeOptionRecord = z.infer<typeof HabitatFeatureTypeQuantitativeOptionRecord>;
