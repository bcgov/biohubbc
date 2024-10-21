import { DeploymentRecord } from '../../database-models/deployment';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryDeploymentRepository } from '../../repositories/telemetry-repositories/telemetry-deployment-repository';
import {
  CreateDeployment,
  ExtendedDeploymentRecord,
  UpdateDeployment
} from '../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
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
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof TelemetryDeploymentService
   */
  async getDeploymentById(surveyId: number, deploymentId: number): Promise<DeploymentRecord> {
    const deployments = await this.telemetryDeploymentRepository.getDeploymentsByIds(surveyId, [deploymentId]);

    if (deployments.length !== 1) {
      throw new ApiGeneralError(`Failed to get deployment`, ['TelemetryDeploymentService->getDeploymentById']);
    }

    return deployments[0];
  }

  /**
   * Get deployments from a list of deployment IDs.
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} deploymentIds A list of deployment IDs
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof TelemetryDeploymentService
   */
  async getDeploymentsByIds(surveyId: number, deploymentIds: number[]): Promise<DeploymentRecord[]> {
    return this.telemetryDeploymentRepository.getDeploymentsByIds(surveyId, deploymentIds);
  }

  /**
   * Get deployments for a Survey.
   *
   * @param {number} surveyId The survey ID
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentService
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<ExtendedDeploymentRecord[]> {
    return this.telemetryDeploymentRepository.getDeploymentsForSurveyId(surveyId);
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
   * Update a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deployment2_id The deployment ID
   * @param {UpdateDeployment} deployment The deployment data to update
   * @return {*}  {Promise<string>}
   * @memberof TelemetryDeploymentService
   */
  async updateDeployment(surveyId: number, deployment2_id: number, deployment: UpdateDeployment): Promise<void> {
    return this.telemetryDeploymentRepository.updateDeployment(surveyId, deployment2_id, deployment);
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
