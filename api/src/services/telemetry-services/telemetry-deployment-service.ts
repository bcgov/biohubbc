import { DeploymentRecord } from '../../database-models/deployment';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { IDeploymentAdvancedFilters } from '../../models/deployment-view';
import { TelemetryDeploymentRepository } from '../../repositories/telemetry-repositories/telemetry-deployment-repository';
import {
  CreateDeployment,
  ExtendedDeploymentRecord,
  UpdateDeployment
} from '../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { DBService } from '../db-service';

/**
 * Service class for working with deployments.
 *
 * @export
 * @class TelemetryDeploymentService
 * @extends {DBService}
 */
export class TelemetryDeploymentService extends DBService {
  telemetryDeploymentRepository: TelemetryDeploymentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.telemetryDeploymentRepository = new TelemetryDeploymentRepository(connection);
  }

  /**
   * Create a new deployment.
   *
   * @param {CreateDeployment} deployment The deployment data to create
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentService
   */
  async createDeployment(deployment: CreateDeployment): Promise<void> {
    return this.telemetryDeploymentRepository.createDeployment(deployment);
  }

  /**
   * Get a specific deployment by its integer ID.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deploymentId The deployment ID
   * @return {*}  {Promise<ExtendedDeploymentRecord>}
   * @memberof TelemetryDeploymentService
   */
  async getDeploymentById(surveyId: number, deploymentId: number): Promise<ExtendedDeploymentRecord> {
    const deployments = await this.telemetryDeploymentRepository.getDeploymentsForSurvey(surveyId, [deploymentId]);

    if (deployments.length !== 1) {
      throw new ApiGeneralError(`Failed to get deployment`, ['TelemetryDeploymentService->getDeploymentById']);
    }

    return deployments[0];
  }

  /**
   * Retrieves the paginated list of deployments under a survey, based on the provided filter params.
   *
   * @param {number} surveyId
   * @param {number[]} [deploymentIds]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentRepository
   */
  async getDeploymentsForSurvey(
    surveyId: number,
    deploymentIds?: number[],
    pagination?: ApiPaginationOptions
  ): Promise<ExtendedDeploymentRecord[]> {
    return this.telemetryDeploymentRepository.getDeploymentsForSurvey(surveyId, deploymentIds, pagination);
  }

  /**
   * Retrieves the paginated list of all deployments that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IDeploymentAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentService
   */
  async findDeployments(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IDeploymentAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<ExtendedDeploymentRecord[]> {
    return this.telemetryDeploymentRepository.findDeployments(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Get deployments for a Critter.
   *
   * @param {number} surveyId The survey ID
   * @param {number} critterId The critter ID
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof TelemetryDeploymentService
   */
  async getDeploymentsForCritterId(surveyId: number, critterId: number): Promise<DeploymentRecord[]> {
    return this.telemetryDeploymentRepository.getDeploymentsForCritterId(surveyId, critterId);
  }

  /**
   * Get the total count of all deployments for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof telemetryDeploymentRepository
   */
  async getDeploymentsCount(surveyId: number): Promise<number> {
    return this.telemetryDeploymentRepository.getDeploymentsCount(surveyId);
  }

  /**
   * Update a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deployment_id The deployment ID
   * @param {UpdateDeployment} deployment The deployment data to update
   * @return {*}  {Promise<string>}
   * @memberof TelemetryDeploymentService
   */
  async updateDeployment(surveyId: number, deployment_id: number, deployment: UpdateDeployment): Promise<void> {
    return this.telemetryDeploymentRepository.updateDeployment(surveyId, deployment_id, deployment);
  }

  /**
   * Delete a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deploymentId The deployment ID
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentService
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<void> {
    return this.telemetryDeploymentRepository.deleteDeployment(surveyId, deploymentId);
  }

  /**
   * Deletes deployments.
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} deploymentIds The deployment IDs
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentService
   */
  async deleteDeployments(surveyId: number, deploymentIds: number[]): Promise<void> {
    return this.telemetryDeploymentRepository.deleteDeployments(surveyId, deploymentIds);
  }
}
