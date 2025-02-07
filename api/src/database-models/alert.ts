import { z } from 'zod';
import { AlertSeverity } from '../database-units/alert_severity';

/**
 * Alert Model.
 *
 * @description Data model for `Alert`.
 */
export const AlertModel = z.object({
  alert_id: z.number(),
  alert_type_id: z.number(),
  name: z.string(),
  message: z.string(),
  severity: AlertSeverity,
  data: z.object({}).nullable(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type AlertModel = z.infer<typeof AlertModel>;

/**
 * Alert Record
 *
 * @description Data record for `Alert`.
 */
export const AlertRecord = AlertModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type AlertRecord = z.infer<typeof AlertRecord>;
