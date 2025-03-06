import { z } from 'zod';

/**
 * Method Lookup Attribute Quantitative Model.
 *
 * @description Data model for `method_lookup_attribute_quantitative`.
 */
export const MethodLookupAttributeQuantitativeModel = z.object({
  method_lookup_attribute_quantitative_id: z.string().uuid(),
  technique_attribute_quantitative_id: z.string().uuid(),
  method_lookup_id: z.number(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  unit: z.string().nullable(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodLookupAttributeQuantitativeModel = z.infer<typeof MethodLookupAttributeQuantitativeModel>;

/**
 * Method Lookup Attribute Quantitative Record.
 *
 * @description Data record for `method_lookup_attribute_quantitative`.
 */
export const MethodLookupAttributeQuantitativeRecord = MethodLookupAttributeQuantitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodLookupAttributeQuantitativeRecord = z.infer<typeof MethodLookupAttributeQuantitativeRecord>;
