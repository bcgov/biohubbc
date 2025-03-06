import { z } from 'zod';

/**
 * Method Technique Attribute Quantitative Model.
 *
 * @description Data model for `method_technique_attribute_quantitative`.
 */
export const MethodTechniqueAttributeQuantitativeModel = z.object({
  method_technique_attribute_quantitative_id: z.number(),
  method_technique_id: z.number(),
  method_lookup_attribute_quantitative_id: z.string().uuid(),
  value: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodTechniqueAttributeQuantitativeModel = z.infer<typeof MethodTechniqueAttributeQuantitativeModel>;

/**
 * Method Technique Attribute Quantitative Record.
 *
 * @description Data record for `method_technique_attribute_quantitative`.
 */
export const MethodTechniqueAttributeQuantitativeRecord = MethodTechniqueAttributeQuantitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodTechniqueAttributeQuantitativeRecord = z.infer<typeof MethodTechniqueAttributeQuantitativeRecord>;
