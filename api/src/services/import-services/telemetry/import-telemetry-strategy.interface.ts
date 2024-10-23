import { z } from 'zod';

export const CsvManualTelemetrySchema = z.object({
  deployment2_id: z.number({ required_error: 'Unable to map vendor and serial number to Deployment ID.' }),
  latitude: z.number(),
  longitude: z.number(),
  acquisition_date: z.string(),
  transmission_date: z.string().nullable()
});

export type CsvManualTelemetry = z.infer<typeof CsvManualTelemetrySchema>;
