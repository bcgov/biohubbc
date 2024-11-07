import { z } from 'zod';

/**
 * Telemetry Lotek Model.
 *
 * @description Data model for `telemetry_lotek`.
 */
export const TelemetryLotekModel = z.object({
  telemetry_lotek_id: z.string().uuid(),
  device_key: z.string(),

  channelstatus: z.string(),
  uploadtimestamp: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number(),
  ecefx: z.number(),
  ecefy: z.number(),
  ecefz: z.number(),
  rxstatus: z.number(),
  pdop: z.number(),
  mainv: z.number(),
  bkupv: z.number(),
  temperature: z.number(),
  fixduration: z.number(),
  bhastempvoltage: z.boolean(),
  devname: z.string().nullable(),
  deltatime: z.number(),
  fixtype: z.number(),
  cepradius: z.number(),
  crc: z.number(),
  deviceid: z.number(),
  recdatetime: z.string(),
  timeid: z.string(),
  geom: z.string().nullable(),

  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

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
