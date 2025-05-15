import { z } from 'zod';

/**
 * Survey Checklist Item Ignore Model.
 *
 * @description Data model for `survey_checklist_item_ignore`.
 */
export const SurveyChecklistItemIgnoreModel = z.object({
  survey_checklist_item_ignore_id: z.number(),
  survey_id: z.number(),
  checklist_item_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyChecklistItemIgnoreModel = z.infer<typeof SurveyChecklistItemIgnoreModel>;

/**
 * Survey Checklist Item Ignore Record.
 *
 * @description Data record for `survey_checklist_item_ignore`.
 */
export const SurveyChecklistItemIgnoreRecord = SurveyChecklistItemIgnoreModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyChecklistItemIgnoreRecord = z.infer<typeof SurveyChecklistItemIgnoreRecord>;
