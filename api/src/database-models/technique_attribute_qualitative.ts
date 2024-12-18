import { z } from 'zod';

/**
 * Technique Attribute Qualitative Model.
 *
 * @description Data model for `technique_attribute_qualitative`.
 */
export const TechniqueAttributeQualitativeModel = z.object({
  technique_attribute_qualitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TechniqueAttributeQualitativeModel = z.infer<typeof TechniqueAttributeQualitativeModel>;

/**
 * Technique Attribute Qualitative Record.
 *
 * @description Data record for `technique_attribute_qualitative`.
 */
export const TechniqueAttributeQualitativeRecord = TechniqueAttributeQualitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TechniqueAttributeQualitativeRecord = z.infer<typeof TechniqueAttributeQualitativeRecord>;
