import { DeploymentFormYupSchema } from 'features/surveys/telemetry/manage/deployments/form/DeploymentForm';
import { FeatureCollection, Point } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';
import yup from 'utils/YupSchema';

export interface IFindTelementryObj {
  telemetry_id: string;
  deployment_id: number;
  critter_id: number;
  vendor: string;
  serial: string;
  acquisition_date: string | null;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  temperature: number | null;
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

export interface IUpdateManualTelemetry {
  telemetry_manual_id: string;
  deployment_id: number;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  transmission_date: string | null;
}
export interface ICreateManualTelemetry {
  deployment_id: number;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  transmission_date: string | null;
}

export interface IManualTelemetry extends ICreateManualTelemetry {
  telemetry_manual_id: string;
}

/**
 * Normalized telemetry record for all vendor types.
 *
 * @export
 * @interface IAllTelemetry
 */
export interface IAllTelemetry {
  telemetry_id: string;
  deployment_id: number;
  critter_id: number;
  vendor: string;
  serial: string;
  acquisition_date: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number | null;
  temperature: number | null;
}

export type ICreateAnimalDeployment = yup.InferType<typeof DeploymentFormYupSchema>;

export type IAllTelemetryPointCollection = { points: FeatureCollection; tracks: FeatureCollection };

export interface ITelemetry {
  id: string;
  /**
   * Either the telemetry_manual_id or telemetry_id (depending on the type of telemetry: manual vs vendor).
   */
  deployment_id: string;
  /**
   * The telemetry_manual_id if the telemetry was manually created.
   * Will be null if the telemetry was retrieved from a vendor.
   */
  telemetry_manual_id: string | null;
  /**
   * The telemetry_id if the telemetry was retrieved from a vendor.
   * Will be null if the telemetry was manually created.
   */
  telemetry_id: number | null;
  /**
   * The latitude of the telemetry.
   */
  latitude: number;
  /**
   * The longitude of the telemetry.
   */
  longitude: number;
  /**
   * The acquisition date of the telemetry.
   */
  acquisition_date: string;
  /**
   * The type of telemetry.
   * Will either be 'MANUAL' (for manual telementry) or the name of the vendor (for vendor telemetry).
   */
  telemetry_type: string;
}

export type TelemetryDeviceKeyFile = {
  survey_telemetry_credential_attachment_id: number;
  uuid: string;
  file_name: string;
  file_type: string;
  file_size: number;
  create_date: string;
  update_date: string | null;
  title: string | null;
  description: string | null;
  key: string;
};

export type TelemetrySpatial = {
  /**
   * The ID of the telemetry record (uuid).
   */
  telemetry_id: string;
  /**
   * The geometry of the telemetry record.
   */
  geometry: Point | null;
};

export type GetSurveyTelemetryResponse = {
  telemetry: IAllTelemetry[];
  count: number;
  pagination: ApiPaginationResponseParams;
};
