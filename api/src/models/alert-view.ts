import { z } from 'zod';

// Define the alert schema
export const IAlert = z.object({
  alert_id: z.number(),
  alert_type_id: z.number().int(),
  name: z.string(),
  message: z.string(),
  severity: z.enum(['info', 'success', 'error', 'warning']),
  data: z.object({}).nullable(),
  record_end_date: z.string().nullable(),
  status: z.enum(['active', 'expired']),
  create_date: z.string()
});

// Infer types from the schema
export type IAlert = z.infer<typeof IAlert>;

export type IAlertUpdateObject = Omit<IAlert, 'status' | 'create_date'>;

export type IAlertCreateObject = Omit<IAlertUpdateObject, 'alert_id'>;

// Filter object for viewing alerts
export interface IAlertFilterObject {
  expiresBefore?: string;
  expiresAfter?: string;
  types?: string[];
}

// Define severity and status types
export type IAlertSeverity = 'info' | 'success' | 'error' | 'warning';
export type IAlertStatus = 'active' | 'expired';
