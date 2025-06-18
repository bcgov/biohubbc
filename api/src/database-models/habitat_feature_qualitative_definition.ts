import { z } from 'zod';

/**
 * Habitat Feature Qualitative Definition Model.
 *
 * @description Data model for `habitat_feature_qualitative_definition`.
 */
export const HabitatFeatureQualitativeDefinitionModel = z.object({
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

export type HabitatFeatureQualitativeDefinitionModel = z.infer<typeof HabitatFeatureQualitativeDefinitionModel>;

/**
 * Habitat Feature Qualitative Definition Record.
 *
 * @description Data record for `habitat_feature_qualitative_definition`.
 */
export const HabitatFeatureQualitativeDefinitionRecord = HabitatFeatureQualitativeDefinitionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureQualitativeDefinitionRecord = z.infer<typeof HabitatFeatureQualitativeDefinitionRecord>;
