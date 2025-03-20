import { z } from 'zod';

/**
 * Habitat Feature Type Model.
 *
 * @description Data model for `habitat_feature_type`.
 */
export const HabitatFeatureTypeModel = z.object({
  habitat_feature_type_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type HabitatFeatureTypeModel = z.infer<typeof HabitatFeatureTypeModel>;

/**
 * Habitat Feature Type Record.
 *
 * @description Data record for `habitat_feature_type`.
 */
export const HabitatFeatureTypeRecord = HabitatFeatureTypeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type HabitatFeatureTypeRecord = z.infer<typeof HabitatFeatureTypeRecord>;
