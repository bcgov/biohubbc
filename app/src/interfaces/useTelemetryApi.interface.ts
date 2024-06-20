import { ApiPaginationResponseParams } from 'types/misc';

export interface IFindTelementryObj {
  telemetry_id: 'string';
  acquisition_date: 'string' | null;
  latitude: 'number' | null;
  longitude: 'number' | null;
  telemetry_type: 'string';
  device_id: 'number';
  bctw_deployment_id: 'string';
  critter_id: 'number';
  deployment_id: 'number';
  critterbase_critter_id: 'string';
  animal_id: 'string' | null;
}

/**
 * Response object for findTelemetry.
 *
 * @export
 * @interface IFindTelemetryResponse
 */
export interface IFindTelemetryResponse {
  telemetry: IFindTelementryObj[];
  pagination: ApiPaginationResponseParams;
}
