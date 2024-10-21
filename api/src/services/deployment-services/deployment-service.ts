import { DeploymentRecord } from '../../database-models/deployment';
import { IDBConnection } from '../../database/db';
import { DeploymentRepository } from '../../repositories/deployment-repository/deployment-repository';
import {
  CreateDeployment,
  ExtendedDeploymentRecord,
  UpdateDeployment
} from '../../repositories/deployment-repository/deployment-repository.interface';
import { DBService } from '../db-service';

/**
 * Service class for working with deployments.
 *
 * @export
 * @class DeploymentService
 * @extends {DBService}
 */
export class DeploymentService extends DBService {
  deploymentRepository: DeploymentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.deploymentRepository = new DeploymentRepository(connection);
  }

  /**
   * Create a new deployment.
   *
   * @param {CreateDeployment} deployment The deployment data to create
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async createDeployment(deployment: CreateDeployment): Promise<void> {
    return this.deploymentRepository.createDeployment(deployment);
  }

  /**
   * Get a specific deployment by its integer ID.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deploymentId The deployment ID
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof DeploymentService
   */
  async getDeploymentById(surveyId: number, deploymentId: number): Promise<DeploymentRecord> {
    return this.deploymentRepository.getDeploymentById(surveyId, deploymentId);
  }

  /**
   * Get deployments for a Survey.
   *
   * @param {number} surveyId The survey ID
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof DeploymentService
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<ExtendedDeploymentRecord[]> {
    return this.deploymentRepository.getDeploymentsForSurveyId(surveyId);
  }

  /**
   * Get deployments for a Critter.
   *
   * @param {number} surveyId The survey ID
   * @param {number} critterId The critter ID
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof DeploymentService
   */
  async getDeploymentsForCritterId(surveyId: number, critterId: number): Promise<DeploymentRecord[]> {
    return this.deploymentRepository.getDeploymentsForCritterId(surveyId, critterId);
  }

  /**
   * Update a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deployment2_id The deployment ID
   * @param {UpdateDeployment} deployment The deployment data to update
   * @return {*}  {Promise<string>}
   * @memberof DeploymentService
   */
  async updateDeployment(surveyId: number, deployment2_id: number, deployment: UpdateDeployment): Promise<void> {
    return this.deploymentRepository.updateDeployment(surveyId, deployment2_id, deployment);
  }

  /**
   * Delete a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deploymentId The deployment ID
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<void> {
    return this.deploymentRepository.deleteDeployment(surveyId, deploymentId);
  }

  /**
   * Deletes deployments.
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} deploymentIds The deployment IDs
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async deleteDeployments(surveyId: number, deploymentIds: number[]): Promise<void> {
    return this.deploymentRepository.deleteDeployments(surveyId, deploymentIds);
  }
}
