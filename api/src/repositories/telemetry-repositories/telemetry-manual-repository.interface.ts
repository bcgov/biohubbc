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
 * Note: Prettifying the type to provide a cleaner hover tooltip in the IDE.
 *
 */
export type UpdateManualTelemetry = Prettify<
  { telemetry_manual_id: string; deployment2_id: number } & Partial<
    Pick<TelemetryManualRecord, 'latitude' | 'longitude' | 'acquisition_date' | 'transmission_date'>
  >
>;

/**
 * Interface reflecting the telemetry manual data required to delete an existing manual telemetry record.
 *
 */
export type DeleteManualTelemetry = Pick<TelemetryManualRecord, 'telemetry_manual_id' | 'deployment2_id'>;
