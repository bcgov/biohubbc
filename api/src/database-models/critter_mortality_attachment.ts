import { z } from 'zod';
/**
 * Critter Mortality Attachment Model.
 *
 * @description Data model for `critter_mortality_attachment`.
 */
export const CritterMortalityAttachmentModel = z.object({
  critter_mortality_attachment_id: z.number(),
  uuid: z.string().nullable(),
  critter_id: z.string(),
  critterbase_mortality_id: z.string(),
  file_type: z.string(),
  file_name: z.string().nullable(),
  file_size: z.number().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  key: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type CritterMortalityAttachmentModel = z.infer<typeof CritterMortalityAttachmentModel>;

/**
 * Critter Mortality Attachment Record.
 *
 * @description Data record for `critter_mortality_attachment`.
 */
export const CritterMortalityAttachmentRecord = CritterMortalityAttachmentModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type CritterMortalityAttachmentRecord = z.infer<typeof CritterMortalityAttachmentRecord>;
