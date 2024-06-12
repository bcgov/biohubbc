import { IManualTelemetry, IVendorTelemetry } from 'hooks/useTelemetryApi';
import { ApiPaginationResponseParams } from 'types/misc';
import { ICritterSimpleResponse } from './useCritterApi.interface';

/**
 * Get survey basic fields response object.
 *
 * @export
 * @interface IfindTelemetryResponse
 */
export interface IfindTelemetryResponse {
  telemetry: { animal: ICritterSimpleResponse & (IVendorTelemetry | IManualTelemetry)[] }[];
  pagination: ApiPaginationResponseParams;
}
