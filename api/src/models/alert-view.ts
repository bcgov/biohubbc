import { z } from 'zod';
import { AlertRecord } from '../database-models/alert';

export const AlertRecordWithStatus = AlertRecord.extend({
  create_date: z.string(),
  status: z.enum(['active', 'expired'])
});
export type AlertRecordWithStatus = z.infer<typeof AlertRecordWithStatus>;

export type IAlertUpdateObject = AlertRecord;

export type IAlertCreateObject = Omit<AlertRecord, 'alert_id'>;

// Filter object for viewing alerts
export interface IAlertFilterObject {
  expiresBefore?: string;
  expiresAfter?: string;
  types?: string[];
}

// Define severity and status types
export type IAlertSeverity = 'info' | 'success' | 'error' | 'warning';
export type IAlertStatus = 'active' | 'expired';
