import { z } from 'zod';

/**
 * Survey Observation Model.
 *
 * @description Data model for `survey_observation`.
 */
export const SurveyObservationModel = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  itis_tsn: z.number(),
  itis_scientific_name: z.string().nullable(),
  survey_sample_period_id: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  count: z.number(),
  observation_time: z.string().nullable(),
  observation_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyObservationModel = z.infer<typeof SurveyObservationModel>;

/**
 * Survey Observation Record.
 *
 * @description Data record for `survey_observation`.
 */
export const SurveyObservationRecord = SurveyObservationModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyObservationRecord = z.infer<typeof SurveyObservationRecord>;
