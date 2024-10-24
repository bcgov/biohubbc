import { z } from 'zod';

export const CsvManualTelemetrySchema = z.object({
  deployment2_id: z.number({ required_error: 'Unable to find deployment with vendor and serial number' }),
  latitude: z.number(),
  longitude: z.number(),
  acquisition_date: z.string(),
  transmission_date: z.string().nullable()
});

export type CsvManualTelemetry = z.infer<typeof CsvManualTelemetrySchema>;
