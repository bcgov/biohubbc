import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryManualRepository } from '../../repositories/telemetry-repositories/telemetry-manual-repository';
import {
  CreateManualTelemetry,
  DeleteManualTelemetry,
  UpdateManualTelemetry
} from '../../repositories/telemetry-repositories/telemetry-manual-repository.interface';
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
  manualRepository: TelemetryManualRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    // Telemetry repositories
    this.vendorRepository = new TelemetryVendorRepository(connection);
    this.manualRepository = new TelemetryManualRepository(connection);
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

  /**
   * Validate deployment IDs exist in a survey.
   *
   * TODO: Move this to the deployment service once implemented.
   *
   * @throws {ApiGeneralError} - If deployment IDs do not exist in the survey
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<void>}
   */
  async _validateSurveyDeploymentIds(surveyId: number, deploymentIds: number[]): Promise<void> {
    // TODO: Fetch deployment IDs from survey once deployment service is implemented
    const surveyDeploymentIds: Set<number> = new Set();

    deploymentIds.forEach((deploymentId) => {
      if (!surveyDeploymentIds.has(deploymentId)) {
        throw new ApiGeneralError('Invalid deployment ID provided for Survey', [
          'TelemetryVendorService->_validateSurveyDeploymentIds',
          `deployment: ${deploymentId} does not exist in survey: ${surveyId}`
        ]);
      }
    });
  }

  /**
   * Create manual telemetry records.
   *
   * @async
   * @param {number} surveyId
   * @param {CreateManualTelemetry[]} telemetry - List of manual telemetry data to create
   * @returns {Promise<void>}
   */
  async bulkCreateManualTelemetry(surveyId: number, telemetry: CreateManualTelemetry[]): Promise<void> {
    const deploymentIds = telemetry.map((t) => t.deployment2_id);

    await this._validateSurveyDeploymentIds(surveyId, deploymentIds);

    return this.manualRepository.bulkCreateManualTelemetry(telemetry);
  }

  /**
   * Create manual telemetry records.
   *
   * @async
   * @param {number} surveyId
   * @param {UpdateManualTelemetry[]} telemetry - List of manual telemetry data to update
   * @returns {Promise<void>}
   */
  async bulkUpdateManualTelemetry(surveyId: number, telemetry: UpdateManualTelemetry[]): Promise<void> {
    const deploymentIds = telemetry.map((t) => t.deployment2_id);

    await this._validateSurveyDeploymentIds(surveyId, deploymentIds);

    return this.manualRepository.bulkUpdateManualTelemetry(telemetry);
  }

  /**
   * Create manual telemetry records.
   *
   * @async
   * @param {number} surveyId
   * @param {DeleteManualTelemetry[]} payload - List of manual telemetry IDs and deployment IDs
   * @returns {Promise<void>}
   */
  async bulkDeleteManualTelemetry(surveyId: number, payload: DeleteManualTelemetry[]): Promise<void> {
    const deploymentIds = payload.map((record) => record.deployment2_id);
    const telemetryManualIds = payload.map((record) => record.telemetry_manual_id);

    // Validate the deployment IDs exist in the survey
    await this._validateSurveyDeploymentIds(surveyId, deploymentIds);

    return this.manualRepository.bulkDeleteManualTelemetry(telemetryManualIds);
  }
}
