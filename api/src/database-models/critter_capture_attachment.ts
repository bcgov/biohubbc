import { z } from 'zod';
/**
 * Note: These files should only contain the `Data Models` and `Data Records` with equivalent inferred types.
 *
 * Data Models contain a 1 to 1 mapping of the database table.
 *
 * Data Records contain a 1 to 1 mapping of the database table, minus the audit columns.
 */

/**
 * Critter Capture Attachment Model.
 *
 * @description Data model for `critter_capture_attachment`.
 */
export const CritterCaptureAttachmentModel = z.object({
  critter_capture_attachment_id: z.number(),
  uuid: z.string().nullable(),
  critter_id: z.number(),
  critterbase_capture_id: z.string(),
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

export type CritterCaptureAttachmentModel = z.infer<typeof CritterCaptureAttachmentModel>;

/**
 * Critter Capture Attachment Record.
 *
 * @description Data record for `critter_capture_attachment`.
 */
export const CritterCaptureAttachmentRecord = CritterCaptureAttachmentModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type CritterCaptureAttachmentRecord = z.infer<typeof CritterCaptureAttachmentRecord>;
