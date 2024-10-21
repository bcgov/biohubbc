import { TelemetryManualRecord } from '../../database-models/telemetry_manual';

/**
 * Interface reflecting the telemetry manual data required to create a new manual telemetry record.
 *
 */
export type CreateManualTelemetry = Pick<
  TelemetryManualRecord,
  'deployment2_id' | 'latitude' | 'longitude' | 'acquisition_date' | 'transmission_date'
>;

/**
 * Interface reflecting the telemetry manual data required to update an existing manual telemetry record.
 *
 */
export type UpdateManualTelemetry = Omit<TelemetryManualRecord, 'deployment2_id'>;
