import { z } from 'zod';

/**
 * Method Technique Vantage Model.
 *
 * @description Data model for `method_technique_vantage`.
 */
export const MethodTechniqueVantageModel = z.object({
  method_technique_vantage_id: z.number(),
  method_technique_id: z.number(),
  vantage_method_id: z.number(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodTechniqueVantageModel = z.infer<typeof MethodTechniqueVantageModel>;

/**
 * Method Technique Vantage Record.
 *
 * @description Data record for `method_technique_vantage`.
 */
export const MethodTechniqueVantageRecord = MethodTechniqueVantageModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodTechniqueVantageRecord = z.infer<typeof MethodTechniqueVantageRecord>;
