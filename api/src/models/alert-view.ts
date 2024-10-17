import { z } from 'zod';

export const IAlert = z.object({
  alert_id: z.number(),
  alert_type_id: z.number().int(),
  name: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'success', 'error', 'warning']),
  data: z.object({}).nullable(),
  record_end_date: z.string().nullable(),
  status: z.enum(['active', 'expired'])
});

export type IAlert = z.infer<typeof IAlert>;

export type IAlertCreateObject = Omit<IAlert, 'alert_id'>;

export interface IAlertFilterObject {
  recordEndDate?: string;
  types?: string[];
}
