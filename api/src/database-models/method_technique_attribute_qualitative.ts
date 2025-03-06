import { z } from 'zod';

/**
 * Method Technique Attribute Qualitative Model.
 *
 * @description Data model for `method_technique_attribute_qualitative`.
 */
export const MethodTechniqueAttributeQualitativeModel = z.object({
  method_technique_attribute_qualitative_id: z.number(),
  method_technique_id: z.number(),
  method_lookup_attribute_qualitative_id: z.string().uuid(),
  method_lookup_attribute_qualitative_option_id: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodTechniqueAttributeQualitativeModel = z.infer<typeof MethodTechniqueAttributeQualitativeModel>;

/**
 * Method Technique Attribute Qualitative Record.
 *
 * @description Data record for `method_technique_attribute_qualitative`.
 */
export const MethodTechniqueAttributeQualitativeRecord = MethodTechniqueAttributeQualitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodTechniqueAttributeQualitativeRecord = z.infer<typeof MethodTechniqueAttributeQualitativeRecord>;
