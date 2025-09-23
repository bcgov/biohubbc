import { z } from 'zod';

/**
 * Collection Survey Model.
 *
 * @description Data model for `CollectionSurvey`.
 */
export const CollectionSurveyModel = z.object({
  collection_survey_id: z.number(),
  collection_id: z.number(),
  survey_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type CollectionSurveyModel = z.infer<typeof CollectionSurveyModel>;

/**
 * Collection Survey Record
 *
 * @description Data record for `CollectionSurvey`.
 */
export const CollectionSurveyRecord = CollectionSurveyModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type CollectionSurveyRecord = z.infer<typeof CollectionSurveyRecord>;
