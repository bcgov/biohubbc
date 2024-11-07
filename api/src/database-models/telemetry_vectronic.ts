import { z } from 'zod';

/**
 * Telemetry Vectronic Model.
 *
 * @description Data model for `telemetry_vectronic`.
 */
export const TelemetryVectronicModel = z.object({
  telemetry_vectronic_id: z.string().uuid(),
  device_key: z.string(),
  idposition: z.number(),
  idcollar: z.number(),
  acquisitiontime: z.string().nullable(),
  scts: z.string().nullable(),
  origincode: z.string().nullable(),
  ecefx: z.number().nullable(),
  ecefy: z.number().nullable(),
  ecefz: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  height: z.number().nullable(),
  dop: z.number().nullable(),
  idfixtype: z.number().nullable(),
  positionerror: z.number().nullable(),
  satcount: z.number().nullable(),

  ch01satid: z.number().nullable(),
  ch01satcnr: z.number().nullable(),
  ch02satid: z.number().nullable(),
  ch02satcnr: z.number().nullable(),
  ch03satid: z.number().nullable(),
  ch03satcnr: z.number().nullable(),
  ch04satid: z.number().nullable(),
  ch04satcnr: z.number().nullable(),
  ch05satid: z.number().nullable(),
  ch05satcnr: z.number().nullable(),
  ch06satid: z.number().nullable(),
  ch06satcnr: z.number().nullable(),
  ch07satid: z.number().nullable(),
  ch07satcnr: z.number().nullable(),
  ch08satid: z.number().nullable(),
  ch08satcnr: z.number().nullable(),
  ch09satid: z.number().nullable(),
  ch09satcnr: z.number().nullable(),
  ch10satid: z.number().nullable(),
  ch10satcnr: z.number().nullable(),
  ch11satid: z.number().nullable(),
  ch11satcnr: z.number().nullable(),
  ch12satid: z.number().nullable(),
  ch12satcnr: z.number().nullable(),

  idmortalitystatus: z.number().nullable(),
  activity: z.number().nullable().nullable(),
  mainvoltage: z.number().nullable(),
  backupvoltage: z.number().nullable(),
  temperature: z.number().nullable(),
  transformedx: z.number().nullable(),
  transformedy: z.number().nullable(),
  geography: z.string().nullable(),

  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TelemetryVectronicModel = z.infer<typeof TelemetryVectronicModel>;

/**
 * Telemetry Vectronic Record.
 *
 * @description Data record for `telemetry_vectronic`.
 */
export const TelemetryVectronicRecord = TelemetryVectronicModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TelemetryVectronicRecord = z.infer<typeof TelemetryVectronicRecord>;
