import { ApiPaginationResponseParams } from 'types/misc';

/**
 * Advanced filters for deployment search.
 */
export interface IAllDeploymentAdvancedFilters {
  /**
   * Filter results by system user id.
   *
   * @type {number}
   * @memberof IAllDeploymentAdvancedFilters
   */
  system_user_id?: number;
  /**
   * Filter results by deployment ids.
   *
   * @type {number[]}
   * @memberof IAllDeploymentAdvancedFilters
   */
  deployment_ids?: number[];
  /**
   * Filter results by survey ids.
   *
   * @type {number[]}
   * @memberof IAllDeploymentAdvancedFilters
   */
  survey_ids?: number[];
  /**
   * Filter results by keyword.
   *
   * @type {string}
   * @memberof IAllDeploymentAdvancedFilters
   */
  keyword?: string;
  /**
   * Filter results by device serial number.
   *
   * @type {string}
   * @memberof IAllDeploymentAdvancedFilters
   */
  device_serial?: string;
  /**
   * Filter results by species (ITIS TSN).
   *
   * @type {number}
   * @memberof IAllDeploymentAdvancedFilters
   */
  species?: number;
  /**
   * Filter results by animal alias/nickname.
   *
   * @type {string}
   * @memberof IAllDeploymentAdvancedFilters
   */
  animal_alias?: string;
}

/**
 * Response object for findTelemetryDeployment.
 */
export interface IFindTelemetryDeploymentResponse {
  deployments: TelemetryDeployment[];
  pagination: ApiPaginationResponseParams;
}

/**
 * Create telemetry deployment record.
 */
export type CreateTelemetryDeployment = {
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string | null;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
};

/**
 * Update telemetry deployment record.
 */
export type UpdateTelemetryDeployment = {
  critter_id: number;
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string | null;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
};

/**
 * Telemetry deployment record.
 */
export type TelemetryDeployment = {
  // deployment data
  deployment_id: number;
  survey_id: number;
  critter_id: number;
  device_id: number;
  device_key: string;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_start_timestamp: string;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  attachment_end_timestamp: string | null;
  critterbase_start_capture_id: string | null;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
  // device data
  serial: string;
  device_make_id: number;
  model: string | null;
  // critter data
  critterbase_critter_id: string;
};

export type GetSurveyDeploymentsResponse = {
  deployments: TelemetryDeployment[];
  count: number;
  pagination: ApiPaginationResponseParams;
};
