import { z } from 'zod';

/**
 * Method Technique Model.
 *
 * @description Data model for `method_technique`.
 */
export const MethodTechniqueModel = z.object({
  method_technique_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  distance_threshold: z.number().nullable(),
  method_lookup_id: z.number(),
  method_response_metric_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodTechniqueModel = z.infer<typeof MethodTechniqueModel>;

/**
 * Method Technique Record.
 *
 * @description Data record for `method_technique`.
 */
export const MethodTechniqueRecord = MethodTechniqueModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodTechniqueRecord = z.infer<typeof MethodTechniqueRecord>;
