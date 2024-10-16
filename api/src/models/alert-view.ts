import { z } from 'zod';

export const IAlert = z.object({
  alert_id: z.number(),
  type: z.string(),
  name: z.string(),
  message: z.string(),
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
