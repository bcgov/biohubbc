import { z } from 'zod';

/**
 * Observation Environment Qualitative Model.
 *
 * @description Data model for `observation_environment_qualitative`.
 */
export const ObservationEnvironmentQualitativeModel = z.object({
  observation_environment_qualitative_id: z.number(),
  survey_observation_id: z.number(),
  environment_qualitative_id: z.string(),
  environment_qualitative_option_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationEnvironmentQualitativeModel = z.infer<typeof ObservationEnvironmentQualitativeModel>;

/**
 * Observation Environment Qualitative Record.
 *
 * @description Data record for `observation_environment_qualitative`.
 */
export const ObservationEnvironmentQualitativeRecord = ObservationEnvironmentQualitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type ObservationEnvironmentQualitativeRecord = z.infer<typeof ObservationEnvironmentQualitativeRecord>;
