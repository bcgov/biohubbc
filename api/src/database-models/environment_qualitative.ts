import { z } from 'zod';

/**
 * Environment Qualitative Model.
 *
 * @description Data model for `environment_qualitative`.
 */
export const EnvironmentQualitativeModel = z.object({
  environment_qualitative_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type EnvironmentQualitativeModel = z.infer<typeof EnvironmentQualitativeModel>;

/**
 * Environment Qualitative Record.
 *
 * @description Data record for `environment_qualitative`.
 */
export const EnvironmentQualitativeRecord = EnvironmentQualitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type EnvironmentQualitativeRecord = z.infer<typeof EnvironmentQualitativeRecord>;
