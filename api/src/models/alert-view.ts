import { z } from 'zod';
import { AlertRecord } from '../database-models/alert';

export const AlertRecordWithStatus = AlertRecord.extend({
  status: z.enum(['active', 'expired'])
});
export type AlertRecordWithStatus = z.infer<typeof AlertRecordWithStatus>;

export type IAlertUpdateObject = Omit<AlertRecord, 'status' | 'create_date'>;

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
