import { z } from 'zod';

/**
 * Environment Qualitative Option Model.
 *
 * @description Data model for `environment_qualitative_option`.
 */
export const EnvironmentQualitativeOptionModel = z.object({
  environment_qualitative_option_id: z.string(),
  environment_qualitative_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type EnvironmentQualitativeOptionModel = z.infer<typeof EnvironmentQualitativeOptionModel>;

/**
 * Environment Qualitative Option Record.
 *
 * @description Data record for `environment_qualitative_option`.
 */
export const EnvironmentQualitativeOptionRecord = EnvironmentQualitativeOptionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type EnvironmentQualitativeOptionRecord = z.infer<typeof EnvironmentQualitativeOptionRecord>;
