import { z } from 'zod';

export const CritterCaptureAttachmentSchema = z.object({
  critter_capture_attachment_id: z.number(),
  uuid: z.string(),
  critter_id: z.string(),
  critterbase_capture_id: z.string(),
  file_type: z.string(),
  file_name: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  key: z.string(),
  file_size: z.number().nullable()
});

export type CritterCaptureAttachment = z.infer<typeof CritterCaptureAttachmentSchema>;

export type CritterCaptureAttachmentPayload = {
  critter_id: number;
  critterbase_capture_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  key: string;
};

export type CritterMortalityAttachmentPayload = {
  critter_id: number;
  critterbase_mortality_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  key: string;
};
