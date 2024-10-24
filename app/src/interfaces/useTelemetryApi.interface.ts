import { DeploymentFormYupSchema } from 'features/surveys/telemetry/manage/deployments/form/DeploymentForm';
import { FeatureCollection } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';
import yup from 'utils/YupSchema';

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

export type IAnimalDeployment = {
  // BCTW properties

  /**
   * The ID of a BCTW collar animal assignment (aka: deployment) record.
   */
  assignment_id: string;
  /**
   * The ID of a BCTW collar record.
   */
  collar_id: string;
  /**
   * The ID of a BCTW critter record. Should match a critter_id in Critterbase.
   */
  critter_id: number;
  /**
   * The ID of a BCTW device.
   */
  device_id: number;
  /**
   * The time the deployment started.
   */
  attachment_start_date: string | null;
  /**
   * The time the deployment started.
   */
  attachment_start_time: string | null;
  /**
   * The time the deployment ended.
   */
  attachment_end_date: string | null;
  /**
   * The time the deployment ended.
   */
  attachment_end_time: string | null;
  /**
   * The ID of a BCTW deployment record.
   */
  bctw_deployment_id: string;
  /**
   * The ID of a BCTW device make record.
   */
  device_make: number;
  /**
   * The model of the device.
   */
  device_model: string | null;
  /**
   * The frequency of the device.
   */
  frequency: number | null;
  /**
   * The ID of a BCTW frequency unit record.
   */
  frequency_unit: number | null;

  // SIMS properties

  /**
   * SIMS deployment record ID
   */
  deployment_id: number;
  /**
   * Critterbase critter ID
   */
  critterbase_critter_id: string;
  /**
   * Critterbase capture ID for the start of the deployment.
   */
  critterbase_start_capture_id: string;
  /**
   * Critterbase capture ID for the end of the deployment.
   */
  critterbase_end_capture_id: string | null;
  /**
   * Critterbase mortality ID for the end of the deployment.
   */
  critterbase_end_mortality_id: string | null;
};

export type ICreateAnimalDeployment = yup.InferType<typeof DeploymentFormYupSchema>;

export interface ICreateAnimalDeploymentPostData extends Omit<ICreateAnimalDeployment, 'device_id'> {
  device_id: number;
}

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

export interface ICodeResponse {
  code_header_title: string;
  code_header_name: string;
  id: number;
  code: string;
  description: string;
  long_description: string;
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
