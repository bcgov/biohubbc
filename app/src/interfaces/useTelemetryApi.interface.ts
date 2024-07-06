export interface ICritterDeploymentResponse {
  critterbase_critter_id: string;
  device_id: number;
  deployment_id: string;
  critter_id: number;
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

export interface ITelemetry {
  id: string;
  deployment_id: string;
  device_id: string;
  telemetry_manual_id: string;
  telemetry_id: number | null;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  telemetry_type: string;
}
