import { z } from 'zod';

/**
 * Technique Attribute Qualitative Option Model.
 *
 * @description Data model for `technique_attribute_qualitative_option`.
 */
export const TechniqueAttributeQualitativeOptionModel = z.object({
  technique_attribute_qualitative_option_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TechniqueAttributeQualitativeOptionModel = z.infer<typeof TechniqueAttributeQualitativeOptionModel>;

/**
 * Technique Attribute Qualitative Option Record.
 *
 * @description Data record for `technique_attribute_qualitative_option`.
 */
export const TechniqueAttributeQualitativeOptionRecord = TechniqueAttributeQualitativeOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TechniqueAttributeQualitativeOptionRecord = z.infer<typeof TechniqueAttributeQualitativeOptionRecord>;
