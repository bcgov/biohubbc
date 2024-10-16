import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { TelemetryLotekRepository } from '../../../repositories/telemetry-repositories/vendors/telemetry-lotek-repository';
import { DBService } from '../../db-service';
import { ITelemetryStrategy } from './telemetry-vendor-context.interface';

/**
 * A service class for working with lotek telemetry and credentials.
 *
 * @export
 * @class TelemetryLotekService
 * @extends {DBService}
 */
export class TelemetryLotekStrategy extends DBService implements ITelemetryStrategy {
  lotekRepository: TelemetryLotekRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.lotekRepository = new TelemetryLotekRepository(connection);
  }

  /**
   * Get all telemetry data by deployment ID.
   *
   * @throws {ApiGeneralError} - If Lotek credentials are invalid or non-existent
   * @param {number} surveyId - Survey ID
   * @param {number} deploymentId - Deployment ID
   * @returns {*} {Promise<Telemetry[]>} - Normalized list of telemetry data
   */
  async getTelemetryByDeploymentId(surveyId: number, deploymentId: number) {
    const validDeployments = await this.lotekRepository.getDeploymentIdsWithValidCredentials(surveyId, [deploymentId]);

    if (validDeployments[0] !== deploymentId) {
      throw new ApiGeneralError('Lotek credentials authentication failure', [
        'TelemetryLotekService -> authorizeTelemetry'
      ]);
    }

    return this.lotekRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId]);
  }

  /**
   * Get all telemetry data by a list of deployment ID's.
   * Note: Silently removes deployments with invalid credentials.
   *
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {*} {Promise<Telemetry[]>}
   */
  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const validDeployments = await this.lotekRepository.getDeploymentIdsWithValidCredentials(surveyId, deploymentIds);

    return this.lotekRepository.getTelemetryByDeploymentIds(surveyId, validDeployments);
  }
}
