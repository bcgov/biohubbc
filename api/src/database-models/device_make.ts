import { z } from 'zod';
/**
 * Device Make Model.
 *
 * @description Data model for `device_make`.
 */
export const DeviceMakeModel = z.object({
  device_make_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  record_effective_date: z.string().nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type DeviceMakeModel = z.infer<typeof DeviceMakeModel>;

/**
 * Device Make Record.
 *
 * @description Data record for `device_make`.
 */
export const DeviceMakeRecord = DeviceMakeModel.omit({
  record_effective_date: true,
  record_end_date: true,
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type DeviceMakeRecord = z.infer<typeof DeviceMakeRecord>;
