import { z } from 'zod';

/**
 * Telemetry Vectronic Model.
 *
 * @description Data model for `telemetry_vectronic`.
 */
export const TelemetryVectronicModel = z.object({
  telemetry_vectronic_id: z.string().uuid(),
  device_key: z.string(),
  idPosition: z.number(),
  idCollar: z.number(),
  acquisitionTime: z.string().nullable(),
  scts: z.string().nullable(),
  originCode: z.string().nullable(),
  ecefX: z.number().nullable(),
  ecefY: z.number().nullable(),
  ecefZ: z.number().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  height: z.number().nullable(),
  dop: z.number().nullable(),
  idFixType: z.number().nullable(),
  positionError: z.number().nullable(),
  satCount: z.number().nullable(),

  ch01SatId: z.number().nullable(),
  ch01SatCnr: z.number().nullable(),
  ch02SatId: z.number().nullable(),
  ch02SatCnr: z.number().nullable(),
  ch03SatId: z.number().nullable(),
  ch03SatCnr: z.number().nullable(),
  ch04SatId: z.number().nullable(),
  ch04SatCnr: z.number().nullable(),
  ch05SatId: z.number().nullable(),
  ch05SatCnr: z.number().nullable(),
  ch06SatId: z.number().nullable(),
  ch06SatCnr: z.number().nullable(),
  ch07SatId: z.number().nullable(),
  ch07SatCnr: z.number().nullable(),
  ch08SatId: z.number().nullable(),
  ch08SatCnr: z.number().nullable(),
  ch09SatId: z.number().nullable(),
  ch09SatCnr: z.number().nullable(),
  ch10SatId: z.number().nullable(),
  ch10SatCnr: z.number().nullable(),
  ch11SatId: z.number().nullable(),
  ch11SatCnr: z.number().nullable(),
  ch12SatId: z.number().nullable(),
  ch12SatCnr: z.number().nullable(),

  idMortalityStatus: z.number().nullable(),
  activity: z.number().nullable().nullable(),
  mainVoltage: z.number().nullable(),
  backupVoltage: z.number().nullable(),
  temperature: z.number().nullable(),
  transformedX: z.number().nullable(),
  transformedY: z.number().nullable(),
  geom: z.string().nullable(),

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
