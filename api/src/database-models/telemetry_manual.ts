import { z } from 'zod';
/**
 * Telemetry Manual Model.
 *
 * @description Data model for `telemetry_manual`.
 */
export const TelemetryManualModel = z.object({
  telemetry_manual_id: z.string().uuid(),
  deployment2_id: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  acquisition_date: z.string(),
  transmission_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type TelemetryManualModel = z.infer<typeof TelemetryManualModel>;

/**
 * Telemetry Manual Record.
 *
 * @description Data record for `telemetry_manual`.
 */
export const TelemetryManualRecord = TelemetryManualModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type TelemetryManualRecord = z.infer<typeof TelemetryManualRecord>;
