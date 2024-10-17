import { IDBConnection } from '../../database/db';
import { TelemetryVendorRepository } from '../../repositories/telemetry-repositories/telemetry-vendor-repository';
import { Telemetry } from '../../repositories/telemetry-repositories/telemetry-vendor-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
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
   * @param {ApiPaginationOptions} [pagination] - Pagination options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployment(
    surveyId: number,
    deploymentId: number,
    pagination?: ApiPaginationOptions
  ): Promise<Telemetry[]> {
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, [deploymentId], pagination);
  }

  /**
   * Get telemetry data for a list of deployments.
   *
   * @async
   * @param {number} surveyId
   * @param {number} deploymentIds
   * @param {ApiPaginationOptions} [pagination] - Pagination options
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployments(
    surveyId: number,
    deploymentIds: number[],
    pagination?: ApiPaginationOptions
  ): Promise<Telemetry[]> {
    return this.vendorRepository.getTelemetryByDeploymentIds(surveyId, deploymentIds, pagination);
  }
}
