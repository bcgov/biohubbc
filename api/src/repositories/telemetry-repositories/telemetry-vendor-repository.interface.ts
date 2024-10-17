import { z } from 'zod';

/**
 * Telemetry vendor enumeration.
 *
 * Note: These values (except MANUAL) must match what exists in the `device_make` table
 */
export enum TelemetryVendorEnum {
  /**
   * Vectronic telemetry vendor.
   *
   * Note: Automatic data fetching nightly via Cronjob.
   */
  VECTRONIC = 'vectronic',
  /**
   * Lotek telemetry vendor.
   *
   * Note: Automatic data fetching nightly via Cronjob.
   */
  LOTEK = 'lotek',
  /**
   * ATS telemetry vendor.
   *
   * Note: Automatic data fetching deprecated. Data still available in database.
   */
  ATS = 'ats',
  /**
   * Manual telemetry vendor.
   *
   * Note: Telemetry that is manually added by users.
   */
  MANUAL = 'manual'
}

export const TelemetrySchema = z.object({
  telemetry_id: z.string(),
  deployment_id: z.number(),
  critter_id: z.number(),
  critterbase_critter_id: z.string().uuid(),
  vendor: z.nativeEnum(TelemetryVendorEnum),
  serial: z.string(),
  acquisition_date: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  elevation: z.number().nullable(),
  temperature: z.number().nullable()
});

export type Telemetry = z.infer<typeof TelemetrySchema>;
