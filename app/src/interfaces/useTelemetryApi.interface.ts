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
