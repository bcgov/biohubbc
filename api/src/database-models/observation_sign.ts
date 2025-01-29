import { z } from 'zod';

/**
 * Observation Sign Model.
 *
 * @description Data model for `observation_sign`.
 */
export const ObservationSignModel = z.object({
  observation_sign_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationSignModel = z.infer<typeof ObservationSignModel>;

/**
 * Observation Sign Record.
 *
 * @description Data record for `observation_sign`.
 */
export const ObservationSignRecord = ObservationSignModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type ObservationSignRecord = z.infer<typeof ObservationSignRecord>;
