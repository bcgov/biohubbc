import { z } from 'zod';

/**
 * Method Lookup Attribute Qualitative Option Model.
 *
 * @description Data model for `method_lookup_attribute_qualitative_option`.
 */
export const MethodLookupAttributeQualitativeOptionModel = z.object({
  method_lookup_attribute_qualitative_option_id: z.string().uuid(),
  method_lookup_attribute_qualitative_id: z.string().uuid(),
  technique_attribute_qualitative_option_id: z.number(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodLookupAttributeQualitativeOptionModel = z.infer<typeof MethodLookupAttributeQualitativeOptionModel>;

/**
 * Method Lookup Attribute Qualitative Option Record.
 *
 * @description Data record for `method_lookup_attribute_qualitative_option`.
 */
export const MethodLookupAttributeQualitativeOptionRecord = MethodLookupAttributeQualitativeOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodLookupAttributeQualitativeOptionRecord = z.infer<typeof MethodLookupAttributeQualitativeOptionRecord>;
