import { IDBConnection } from '../database/db';
import { IPostSurveyDeployment, SurveyDeployment } from '../models/survey-deployment';
import { DeploymentRepository } from '../repositories/deployment-repository';
import { DBService } from './db-service';

/**
 * Service layer for survey critters.
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
   * Get deployments for a Survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<SurveyDeployment[]> {
    return this.deploymentRepository.getDeploymentsForSurveyId(surveyId);
  }

  /**
   * Get a specific deployment by its integer ID
   *
   * @param {number} deploymentId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async getDeploymentById(deploymentId: number): Promise<SurveyDeployment> {
    return this.deploymentRepository.getDeploymentById(deploymentId);
  }

  /**
   * Create a new deployment
   *
   * @param {IPostSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async insertDeployment(deployment: IPostSurveyDeployment): Promise<void> {
    return this.deploymentRepository.insertDeployment(deployment);
  }

  /**
   * Update a deployment in SIMS
   *
   * @param {IPostSurveyDeployment} deploymentId
   * @param {IPostSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async updateDeployment(deploymentId: number, deployment: IPostSurveyDeployment): Promise<void> {
    return this.deploymentRepository.updateDeployment(deploymentId, deployment);
  }

  /**
   * Removes the deployment in SIMS.
   *
   * @param {number} critterId
   * @param {string} deploymentId the bctw deployment uuid
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    return this.deploymentRepository.removeDeployment(critterId, deploymentId);
  }
}
