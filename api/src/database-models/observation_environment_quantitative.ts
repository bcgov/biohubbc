import { z } from 'zod';

/**
 * Observation Environment Quantitative Model.
 *
 * @description Data model for `observation_environment_quantitative`.
 */
export const ObservationEnvironmentQuantitativeModel = z.object({
  observation_environment_quantitative_id: z.number(),
  survey_observation_id: z.number(),
  environment_quantitative_id: z.string().uuid(),
  value: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationEnvironmentQuantitativeModel = z.infer<typeof ObservationEnvironmentQuantitativeModel>;

/**
 * Observation Environment Quantitative Record.
 *
 * @description Data record for `observation_environment_quantitative`.
 */
export const ObservationEnvironmentQuantitativeRecord = ObservationEnvironmentQuantitativeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type ObservationEnvironmentQuantitativeRecord = z.infer<typeof ObservationEnvironmentQuantitativeRecord>;
