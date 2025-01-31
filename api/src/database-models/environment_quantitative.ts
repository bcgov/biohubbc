import { z } from 'zod';
import { EnvironmentUnit } from '../repositories/observation-environment-repository';

/**
 * Environment Quantitative Model.
 *
 * @description Data model for `environment_quantitative`.
 */
export const EnvironmentQuantitativeModel = z.object({
  environment_quantitative_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  unit: EnvironmentUnit.nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type EnvironmentQuantitativeModel = z.infer<typeof EnvironmentQuantitativeModel>;

/**
 * Environment Quantitative Record.
 *
 * @description Data record for `environment_quantitative`.
 */
export const EnvironmentQuantitativeRecord = EnvironmentQuantitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type EnvironmentQuantitativeRecord = z.infer<typeof EnvironmentQuantitativeRecord>;
