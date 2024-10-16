import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { TelemetryLotekRepository } from '../../../repositories/telemetry-repositories/vendors/telemetry-lotek-repository';
import { DBService } from '../../db-service';
import { ITelemetryStrategy } from './telemetry-vendor-strategy.interface';

/**
 * A service class for working with lotek telemetry and credentials.
 *
 * @export
 * @class TelemetryLotekService
 * @extends {DBService}
 */
export class TelemetryLotekService extends DBService implements ITelemetryStrategy {
  lotekRepository: TelemetryLotekRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.lotekRepository = new TelemetryLotekRepository(connection);
  }

  async getTelemetryByDeploymentId(surveyId: number, deploymentId: number) {
    const validDeployments = await this.lotekRepository.getDeploymentIdsWithValidCredentials(surveyId, [deploymentId]);

    if (validDeployments[0] !== deploymentId) {
      throw new ApiGeneralError('Lotek credentials authentication failure', [
        'TelemetryLotekService -> authorizeTelemetry'
      ]);
    }

    return this.lotekRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId]);
  }

  async getTelemetryByDeploymentIds(surveyId: number, deploymentIds: number[]) {
    const validDeployments = await this.lotekRepository.getDeploymentIdsWithValidCredentials(surveyId, deploymentIds);

    return this.lotekRepository.getTelemetryByDeploymentIds(surveyId, validDeployments);
  }
}
