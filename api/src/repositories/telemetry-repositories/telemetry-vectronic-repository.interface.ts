import { z } from 'zod';
import { TelemetryVectronicRecord } from '../../database-models/telemetry_vectronic';

/**
 * Interface reflecting the vectronic data required to create a new vectronic telemetry record
 *
 */
export type VectronicPayload = Omit<TelemetryVectronicRecord, 'telemetry_vectronic_id' | 'device_key'>;

const VectronicAPIQuery = z.object({
  idcollar: z.number(),
  collarkey: z.string(),
  afterAcquisition: z.string().optional(), // Request data after or equal to this date
  beforeAcquisition: z.string().optional(), // Request data before or equal to this date
  gtId: z.number().optional() // gt-id Request data greater or equal than the isposition
});

export type VectronicAPIQuery = z.infer<typeof VectronicAPIQuery>;

const VectronicTask = z.object({
  serial: z.number(), // idcollar
  key: z.string() // collarkey
});

export type VectronicTask = z.infer<typeof VectronicTask>;

/**
 * Vectronic device key data structure
 *
 * @export
 * @interface IKeyxData
 * @typedef {IKeyxData}
 */
export interface IKeyxData {
  id: string;
  key: string;
  comID: string;
  comType: string;
  collarType: number;
}
