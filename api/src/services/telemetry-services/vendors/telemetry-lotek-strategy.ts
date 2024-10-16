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
    const validCredentials = await this.lotekRepository.deploymentHasValidCredentials(surveyId, [deploymentId]);

    // If credentials are invalid, throw an error
    if (!validCredentials) {
      throw new ApiGeneralError('Lotek credentials authentication failure', [
        'TelemetryLotekStrategy -> authorizeTelemetry'
      ]);
    }

    return this.lotekRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId]);
  }
}
