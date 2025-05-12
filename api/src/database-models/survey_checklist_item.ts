import { z } from 'zod';

/**
 * Survey Checklist Item Model.
 *
 * @description Data model for `survey_checklist_item`.
 */
export const SurveyChecklistItemModel = z.object({
  survey_checklist_item_id: z.number(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  record_effective_date: z.string(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyChecklistItemModel = z.infer<typeof SurveyChecklistItemModel>;

/**
 * Survey Checklist Item Record.
 *
 * @description Data record for `survey_checklist_item`.
 */
export const SurveyChecklistItemRecord = SurveyChecklistItemModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SurveyChecklistItemRecord = z.infer<typeof SurveyChecklistItemRecord>;
