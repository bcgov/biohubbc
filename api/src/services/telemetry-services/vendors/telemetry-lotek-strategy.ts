import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { TelemetryLotekRepository } from '../../../repositories/telemetry-repositories/vendors/telemetry-lotek-repository';
import { DBService } from '../../db-service';
import { ITelemetryStrategy } from '../telemetry.interface';

/**
 * A telemetry strategy for working with Lotek telemetry data, credentials or Lotek API.
 *
 * @export
 * @class TelemetryLotekStrategy
 * @extends {DBService}
 * @implements {ITelemetryStrategy}
 */
export class TelemetryLotekStrategy extends DBService implements ITelemetryStrategy {
  lotekRepository: TelemetryLotekRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.lotekRepository = new TelemetryLotekRepository(connection);
  }

  /**
   * Get telemetry data by deployment ID.
   *
   * Note: This will also return manual telemetry data.
   *
   * Why? Manual telemetry is essentially supplemental data that is added by users for that vendor.
   * This allows us to order and sort both telemetry sources together and filter as needed.
   *
   * @throws {ApiGeneralError} If the telemetry credentials are invalid
   * @param {number} surveyId - Survey ID
   * @param {number} deploymentId - Deployment ID
   * @return {*} {Promise<ITelemetry[]>} - Normalized list of telemetry data
   */
  async getTelemetryByDeploymentId(surveyId: number, deploymentId: number) {
    const validCredentials = await this.lotekRepository.getValidCredentialsForDeploymentIds(surveyId, [deploymentId]);

    // If no valid credentials are found, throw an error
    if (validCredentials.length) {
      throw new ApiGeneralError('Lotek credentials authorization failed', [
        'TelemetryLotekStrategy -> authorizeTelemetry'
      ]);
    }

    return this.lotekRepository.getLotekAndManualTelemetryByDeploymentIds(surveyId, [deploymentId]);
  }

  /**
   * Get telemetry data by deployment IDs.
   *
   * Note: This will only return telemetry for deployments with valid credentials.
   *
   * @param {number} surveyId - Survey ID
   * @param {number[]} deploymentIds - List of deployment ID's
   * @return {*} {Promise<ITelemetry[]>} - Normalized list of telemetry data
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const validCredentials = await this.lotekRepository.getValidCredentialsForDeploymentIds(surveyId, deploymentIds);
    const validDeploymentIds = validCredentials.map((credential) => credential.deployment_id);

    // Get the telemetry data for the valid deployment IDs
    return this.lotekRepository.getLotekAndManualTelemetryByDeploymentIds(surveyId, validDeploymentIds);
  }
}
