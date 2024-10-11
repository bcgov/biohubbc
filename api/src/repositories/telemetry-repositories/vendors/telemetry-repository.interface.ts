import { z } from 'zod';
import { TelemetryVendor } from '../../../services/telemetry-services/telemetry.interface';

export const TelemetrySchema = z.object({
  telemetry_id: z.string(),
  deployment_id: z.string(),
  critter_id: z.string().nullable(),
  vendor: z.nativeEnum(TelemetryVendor),
  serial: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  elevation: z.number().nullable(),
  temperature: z.number().nullable()
});

export type ITelemetry = z.infer<typeof TelemetrySchema>;
