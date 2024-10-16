import { IDBConnection } from '../../database/db';
import { TelemetryVendorRepository } from '../../repositories/telemetry-repositories/telemetry-vendor-repository';
import { Telemetry } from '../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { DBService } from '../db-service';

/**
 * A service class for working with telemetry vendor data.
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryVendorService extends DBService {
  vendorRepository: TelemetryVendorRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.vendorRepository = new TelemetryVendorRepository(connection);
  }

  /**
   * Get telemetry data for a single deployment.
   *
   * @async
   * @param {number} surveyId
   * @param {number} deploymentId
   * @param {number} [limit] - Limit the number of telemetry records returned
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployment(surveyId: number, deploymentId: number, limit?: number): Promise<Telemetry[]> {
    // TODO: Validate credentials
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId], limit);
  }

  /**
   * Get telemetry data for a list of deployments.
   *
   * @async
   * @param {number} surveyId
   * @param {number} deploymentIds
   * @param {number} [limit] - Limit the number of telemetry records returned
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployments(surveyId: number, deploymentIds: number[], limit?: number): Promise<Telemetry[]> {
    // TODO: Validate credentials and only pass valid deployment_ids
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, limit);
  }
}
