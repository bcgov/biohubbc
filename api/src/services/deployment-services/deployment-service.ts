import { DeploymentRecord } from '../../database-models/deployment';
import { IDBConnection } from '../../database/db';
import { DeploymentRepository } from '../../repositories/deployment-repository/deployment-repository';
import {
  CreateDeployment,
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
   * @param {number} surveyId
   * @param {CreateDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async createDeployment(surveyId: number, deployment: CreateDeployment): Promise<void> {
    return this.deploymentRepository.createDeployment(surveyId, deployment);
  }

  /**
   * Get a specific deployment by its integer ID.
   *
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof DeploymentService
   */
  async getDeploymentById(surveyId: number, deploymentId: number): Promise<DeploymentRecord> {
    return this.deploymentRepository.getDeploymentById(surveyId, deploymentId);
  }

  /**
   * Get deployments for a Survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<DeploymentRecord[]>}
   * @memberof DeploymentService
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<DeploymentRecord[]> {
    return this.deploymentRepository.getDeploymentsForSurveyId(surveyId);
  }

  /**
   * Get deployments for a Critter.
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<DeploymentRecord>}
   * @memberof DeploymentService
   */
  async getDeploymentsForCritterId(surveyId: number, critterId: number): Promise<DeploymentRecord[]> {
    return this.deploymentRepository.getDeploymentsForCritterId(surveyId, critterId);
  }

  /**
   * Update a deployment.
   *
   * @param {number} surveyId
   * @param {UpdateDeployment} deployment
   * @return {*}  {Promise<string>}
   * @memberof DeploymentService
   */
  async updateDeployment(surveyId: number, deployment: UpdateDeployment): Promise<void> {
    return this.deploymentRepository.updateDeployment(surveyId, deployment);
  }

  /**
   * Delete a deployment.
   *
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<void> {
    return this.deploymentRepository.deleteDeployment(surveyId, deploymentId);
  }
}
