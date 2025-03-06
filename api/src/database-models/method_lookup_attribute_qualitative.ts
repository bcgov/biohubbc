import { z } from 'zod';

/**
 * Method Lookup Attribute Qualitative Model.
 *
 * @description Data model for `method_lookup_attribute_qualitative`.
 */
export const MethodLookupAttributeQualitativeModel = z.object({
  method_lookup_attribute_qualitative_id: z.string().uuid(),
  technique_attribute_qualitative_id: z.string().uuid(),
  method_lookup_id: z.number(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodLookupAttributeQualitativeModel = z.infer<typeof MethodLookupAttributeQualitativeModel>;

/**
 * Method Lookup Attribute Qualitative Record.
 *
 * @description Data record for `method_lookup_attribute_qualitative`.
 */
export const MethodLookupAttributeQualitativeRecord = MethodLookupAttributeQualitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodLookupAttributeQualitativeRecord = z.infer<typeof MethodLookupAttributeQualitativeRecord>;
