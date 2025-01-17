import { z } from 'zod';

/**
 * Technique Attribute Quantitative Model.
 *
 * @description Data model for `technique_attribute_quantitative`.
 */
export const TechniqueAttributeQuantitativeModel = z.object({
  technique_attribute_quantitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TechniqueAttributeQuantitativeModel = z.infer<typeof TechniqueAttributeQuantitativeModel>;

/**
 * Technique Attribute Quantitative Record.
 *
 * @description Data record for `technique_attribute_quantitative`.
 */
export const TechniqueAttributeQuantitativeRecord = TechniqueAttributeQuantitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TechniqueAttributeQuantitativeRecord = z.infer<typeof TechniqueAttributeQuantitativeRecord>;
