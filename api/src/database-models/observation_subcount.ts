import { z } from 'zod';

/**
 * Observation Subcount Model.
 *
 * @description Data model for `observation_subcount`.
 */
export const ObservationSubcountModel = z.object({
  observation_subcount_id: z.number(),
  survey_observation_id: z.number(),
  subcount: z.number(),
  comment: z.string().nullable(),
  critterbase_critter_id: z.string().uuid().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationSubcountModel = z.infer<typeof ObservationSubcountModel>;

/**
 * Observation Subcount Record.
 *
 * @description Data record for `observation_subcount`.
 */
export const ObservationSubcountRecord = ObservationSubcountModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type ObservationSubcountRecord = z.infer<typeof ObservationSubcountRecord>;
