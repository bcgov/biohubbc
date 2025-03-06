import { z } from 'zod';
/**
 * Device Model.
 *
 * @description Data model for `device`.
 */
export const DeviceModel = z.object({
  device_id: z.number(),
  survey_id: z.number(),
  device_key: z.string(),
  serial: z.string(),
  device_make_id: z.number(),
  model: z.string().nullable(),
  comment: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type DeviceModel = z.infer<typeof DeviceModel>;

/**
 * Device Record.
 *
 * @description Data record for `device`.
 */
export const DeviceRecord = DeviceModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type DeviceRecord = z.infer<typeof DeviceRecord>;
