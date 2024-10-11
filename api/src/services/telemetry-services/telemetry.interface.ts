import { ITelemetry } from '../../repositories/telemetry-repositories/vendors/telemetry-repository.interface';

export enum TelemetryVendor {
  /**
   * Vectronic telemetry vendor.
   *
   * Note: Automatic data fetching nightly via Cronjob.
   */
  VECTRONIC = 'vectronic',
  /**
   * Lotek telemetry vendor.
   *
   * Note: Automatic data fetching nightly via Cronjob.
   */
  LOTEK = 'lotek',
  /**
   * ATS telemetry vendor.
   *
   * Note: Automatic data fetching deprecated. Data still available in database.
   */
  ATS = 'ats',
  /**
   * Manual telemetry vendor.
   *
   * Note: Telemetry that is manually added by users.
   */
  MANUAL = 'manual'
}

/**
 * A strategy interface for working with telemetry data from different vendors.
 *
 */
export interface ITelemetryStrategy {
  /**
   * Get all telemetry data by deployment ID for the vendor.
   *
   * Note: This should return all sources of telemetry for vendor.
   * ie: vendor telemetry + manual vendor telemetry.
   *
   * @param {number} surveyId - Survey ID
   * @param {number} deploymentId - Deployment ID
   * @param {number} [limit] - Limit the number of telemetry records returned
   * @return {*} {Promise<ITelemetry[]>} - Normalized list of telemetry data
   */
  getTelemetryByDeploymentId: (surveyId: number, deploymentId: number, limit?: number) => Promise<ITelemetry[]>;

  /**
   * Get all telemetry data by a list of deployment IDs.
   *
   * Note: This should return all sources of telemetry for the vendor.
   * ie: vendor telemetry + manual vendor telemetry.
   *
   * @param {number} surveyId - Survey ID
   * @param {number[]} deploymentIds - List of deployment ID's
   * @param {number} [limit] - Limit the number of telemetry records returned
   * @return {*} {Promise<ITelemetry[]>} - Normalized list of telemetry data
   */
  getTelemetryByDeploymentIds: (surveyId: number, deploymentIds: number[], limit?: number) => Promise<ITelemetry[]>;
}
