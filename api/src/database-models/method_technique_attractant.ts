import { z } from 'zod';

/**
 * Method Technique Attractant Model.
 *
 * @description Data model for `method_technique_attractant`.
 */
export const MethodTechniqueAttractantModel = z.object({
  method_technique_attractant_id: z.number(),
  method_technique_id: z.number(),
  attractant_lookup_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MethodTechniqueAttractantModel = z.infer<typeof MethodTechniqueAttractantModel>;

/**
 * Method Technique Attractant Record.
 *
 * @description Data record for `method_technique_attractant`.
 */
export const MethodTechniqueAttractantRecord = MethodTechniqueAttractantModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MethodTechniqueAttractantRecord = z.infer<typeof MethodTechniqueAttractantRecord>;
