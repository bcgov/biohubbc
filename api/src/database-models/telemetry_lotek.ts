import { z } from 'zod';

/**
 * Telemetry Lotek Model.
 *
 * @description Data model for `telemetry_lotek`.
 */
export const TelemetryLotekModel = z.object({
  telemetry_lotek_id: z.string().uuid(),
  device_key: z.string(),

  recdatetime: z.string().nullable(), // Timestamp the telemetry was recorded - use this
  uploadtimestamp: z.string().nullable(), // Timestamp telemetry was uploaded - ignore this
  channelstatus: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  altitude: z.number().nullable(),
  ecefx: z.number().nullable(),
  ecefy: z.number().nullable(),
  ecefz: z.number().nullable(),
  rxstatus: z.number().nullable(),
  pdop: z.number().nullable(),
  mainv: z.number().nullable(),
  bkupv: z.number().nullable(),
  temperature: z.number().nullable(),
  fixduration: z.number().nullable(),
  bhastempvoltage: z.boolean().nullable(),
  devname: z.string().nullable().nullable(),
  deltatime: z.number().nullable(),
  fixtype: z.number().nullable(),
  cepradius: z.number().nullable(),
  crc: z.number().nullable(),
  deviceid: z.number().nullable(),
  geography: z.string().nullable().nullable(),

  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TelemetryLotekModel = z.infer<typeof TelemetryLotekModel>;

/**
 * Telemetry Lotek Record.
 *
 * @description Data record for `telemetry_lotek`.
 */
export const TelemetryLotekRecord = TelemetryLotekModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TelemetryLotekRecord = z.infer<typeof TelemetryLotekRecord>;
