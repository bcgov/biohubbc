import { TelemetryManualRecord } from '../../database-models/telemetry_manual';
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
import { DeploymentService } from '../deployment-services/deployment-service';

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

  deploymentService: DeploymentService;

  constructor(connection: IDBConnection) {
    super(connection);

    // Telemetry repositories
    this.vendorRepository = new TelemetryVendorRepository(connection);
    this.manualRepository = new TelemetryManualRepository(connection);

    // Services
    this.deploymentService = new DeploymentService(connection);
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
   * @throws {ApiGeneralError} - If deployment IDs do not exist in the survey
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<void>}
   */
  async _validateSurveyDeploymentIds(surveyId: number, deploymentIds: number[]): Promise<void> {
    const surveyDeployments = await this.deploymentService.getDeploymentsForSurveyId(surveyId);

    const surveyDeploymentIds = new Set(surveyDeployments.map((deployment) => deployment.deployment2_id));

    for (const deploymentId of deploymentIds) {
      if (!surveyDeploymentIds.has(deploymentId)) {
        throw new ApiGeneralError('Invalid deployment ID provided for survey', [
          'TelemetryVendorService->_validateSurveyDeploymentIds',
          `deployment: ${deploymentId} does not exist in survey: ${surveyId}`
        ]);
      }
    }
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

    // Validate the deployment IDs exist in the survey
    await this._validateSurveyDeploymentIds(surveyId, deploymentIds);

    return this.manualRepository.bulkCreateManualTelemetry(telemetry);
  }

  /**
   * Update manual telemetry records.
   *
   * Note: Removes the `deployent2_id` from the records before updating.
   *
   * @async
   * @param {number} surveyId
   * @param {TelemetryManualRecord[]} telemetry - List of manual telemetry data to update
   * @returns {Promise<void>}
   */
  async bulkUpdateManualTelemetry(surveyId: number, telemetry: TelemetryManualRecord[]): Promise<void> {
    const updateTelemetry: UpdateManualTelemetry[] = [];
    const deploymentIds: number[] = [];

    for (const record of telemetry) {
      const { deployment2_id, ...updateRecord } = record;
      deploymentIds.push(deployment2_id); // survey deployment validation
      updateTelemetry.push(updateRecord); // update payload
    }

    // Validate the deployment IDs exist in the survey
    await this._validateSurveyDeploymentIds(surveyId, deploymentIds);

    return this.manualRepository.bulkUpdateManualTelemetry(updateTelemetry);
  }

  /**
   * Delete manual telemetry records.
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
