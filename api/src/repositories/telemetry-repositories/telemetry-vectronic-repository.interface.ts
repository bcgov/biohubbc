import { z } from 'zod';
import { TelemetryVectronicRecord } from '../../database-models/telemetry_vectronic';

/**
 * Interface reflecting the vectronic data required to create a new vectronic telemetry record
 *
 */
export type CreateVectronicTelemetry = Omit<TelemetryVectronicRecord, 'telemetry_vectronic_id' | 'device_key'>;

const VectronicCredential = z.object({
  idcollar: z.number(),
  collarkey: z.string()
});

export type VectronicCredential = z.infer<typeof VectronicCredential>;

const VectronicAPIQuery = z.object({
  idcollar: z.number(),
  collarkey: z.string(),
  dtstart: z.string().optional(),
  dtend: z.string().optional()
});

export type VectronicAPIQuery = z.infer<typeof VectronicAPIQuery>;
