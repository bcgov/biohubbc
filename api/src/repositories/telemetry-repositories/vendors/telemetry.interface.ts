import { Knex } from 'knex';
import { z } from 'zod';
import { TelemetryVendor } from '../../../services/telemetry-services/telemetry.interface';

export const TelemetrySchema = z.object({
  telemetry_id: z.string(),
  deployment_id: z.number(),
  critter_id: z.number(),
  critterbase_critter_id: z.string().uuid(),
  device_make: z.nativeEnum(TelemetryVendor),
  serial: z.string(),
  acquisition_date: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  elevation: z.number().nullable(),
  temperature: z.number().nullable()
});

export type Telemetry = z.infer<typeof TelemetrySchema>;

export type ITelemetryRepositoryStrategy = {
  getTelemetryByDeploymentIdsBaseQuery(surveyId: number, deploymentIds: number): Knex.QueryBuilder;
};
