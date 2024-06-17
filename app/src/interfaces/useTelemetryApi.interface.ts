import { ITelemetry } from 'hooks/useTelemetryApi';
import { ApiPaginationResponseParams } from 'types/misc';
import { ICritterSimpleResponse } from './useCritterApi.interface';

/**
 * Response object for findTelemetry.
 *
 * @export
 * @interface IFindTelemetryResponse
 */
export interface IFindTelemetryResponse {
  animalTelemetry: { animal: ICritterSimpleResponse; telemetry: ITelemetry[] }[];
  pagination: ApiPaginationResponseParams;
}
