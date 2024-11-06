import { z } from 'zod';
import { TelemetryCredentialVectronicRecord } from '../../database-models/telemetry_credential_vectronic';
import { TelemetryVectronicRecord } from '../../database-models/telemetry_vectronic';

/**
 * Interface reflecting the vectronic data required to create a new vectronic telemetry record
 *
 */
export type CreateVectronicTelemetry = Omit<TelemetryVectronicRecord, 'telemetry_vectronic_id' | 'device_key'>;

const VectronicAPIQuery = z.object({
  idcollar: z.number(),
  collarkey: z.string(),
  afterAcquisition: z.string().optional(),
  beforeAcquisition: z.string().optional(),
  gtId: z.string().optional() // gt-id
});

export type VectronicAPIQuery = z.infer<typeof VectronicAPIQuery>;

/**
 * Extended Vectronic Credential Record.
 *
 * Note: `max_idposition` is the maximum `idposition` value in the telemetry data for the given credential.
 */
export const ExtendedVectronicCredential = TelemetryCredentialVectronicRecord.merge(
  z.object({ max_idposition: z.number().nullable() })
);

export type ExtendedVectronicCredential = z.infer<typeof ExtendedVectronicCredential>;
