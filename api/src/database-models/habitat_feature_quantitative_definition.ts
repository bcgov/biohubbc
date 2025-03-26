import { z } from 'zod';
import { QuantitativeUnitType } from '../database-units/quantitative_unit';

/**
 * Habitat Feature Quantitative Definition Model.
 *
 * @description Data model for `habitat_feature_quantitative_definition`.
 */
export const HabitatFeatureQuantitativeDefinitionModel = z.object({
  habitat_feature_quantitative_definition_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  unit: QuantitativeUnitType,
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type HabitatFeatureQuantitativeDefinitionModel = z.infer<typeof HabitatFeatureQuantitativeDefinitionModel>;

/**
 * Habitat Feature Quantitative Definition Record.
 *
 * @description Data record for `habitat_feature_quantitative_definition`.
 */
export const HabitatFeatureQuantitativeDefinitionRecord = HabitatFeatureQuantitativeDefinitionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureQuantitativeDefinitionRecord = z.infer<typeof HabitatFeatureQuantitativeDefinitionRecord>;
