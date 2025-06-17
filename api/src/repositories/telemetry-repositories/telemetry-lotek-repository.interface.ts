import { z } from 'zod';
import { TelemetryLotekRecord } from '../../database-models/telemetry_lotek';

/**
 * Lotek API query parameters.
 *
 * @see https://webservice.lotek.com/API/Help
 */
export const LotekAPIQuery = z.object({
  deviceId: z.number(), // serial
  dtStart: z.string().optional(), // start date
  dtEnd: z.string().optional() // end date
});

export type LotekAPIQuery = z.infer<typeof LotekAPIQuery>;

export const LotekTask = z.object({
  serial: z.number() // deviceId
});

export type LotekTask = z.infer<typeof LotekTask>;

export const LotekPayload = TelemetryLotekRecord.omit({
  telemetry_lotek_id: true,
  device_key: true,
  geography: true
});

export type LotekPayload = z.infer<typeof LotekPayload>;

/**
 * Lotek device key data structure
 *
 * @export
 * @interface ICfgData
 * @typedef {ICfgData}
 */
export interface ICfgData {
  id: number;
  key: string;
  'Iridium IMEI': number;
}
