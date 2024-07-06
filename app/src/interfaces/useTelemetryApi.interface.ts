import { ApiPaginationResponseParams } from 'types/misc';

export interface IFindTelementryObj {
  telemetry_id: string;
  acquisition_date: string | null;
  latitude: number | null;
  longitude: number | null;
  telemetry_type: string;
  device_id: number;
  bctw_deployment_id: string;
  critter_id: number;
  deployment_id: number;
  critterbase_critter_id: string;
  animal_id: string | null;
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

export interface ICritterDeploymentResponse {
  critter_id: string;
  device_id: number;
  deployment_id: string;
  survey_critter_id: string;
  alias: string;
  attachment_start: string;
  attachment_end?: string;
  taxon: string;
}

export interface IUpdateManualTelemetry {
  telemetry_manual_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}
export interface ICreateManualTelemetry {
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}

export interface IManualTelemetry extends ICreateManualTelemetry {
  telemetry_manual_id: string;
}

export interface IVendorTelemetry extends ICreateManualTelemetry {
  telemetry_id: string;
}

export interface IAllTelemetry {
  id: string;
  deployment_id: string;
  telemetry_manual_id: string;
  telemetry_id: number | null;
  device_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  telemetry_type: string;
}
