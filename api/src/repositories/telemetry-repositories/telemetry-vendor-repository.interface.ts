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
  telemetry_id: z.string(), // Vendor telemetry ID (Primary Key)
  deployment_id: z.number(), // SIMS Deployment ID
  critter_id: z.number(), // SIMS Critter ID
  vendor: z.nativeEnum(TelemetryVendorEnum), // Telemetry vendor
  serial: z.string(), // Telemetry device serial number
  acquisition_date: z.string(), // Date telemetry was retrieved
  latitude: z.number().nullable(), // Latitude of telemetry (Y axis)
  longitude: z.number().nullable(), // Longitude of telemetry (X axis)
  elevation: z.number().nullable(), // Elevation of telemetry in meters
  temperature: z.number().nullable() // Temperature in Celsius
});

export type Telemetry = z.infer<typeof TelemetrySchema>;
