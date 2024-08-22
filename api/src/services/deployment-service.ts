import { IDBConnection } from '../database/db';
import { ICreateSurveyDeployment, IUpdateSurveyDeployment, SurveyDeployment } from '../models/survey-deployment';
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
   * Get a specific deployment by its integer ID
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async getDeploymentForCritterId(surveyId: number, critterId: number): Promise<SurveyDeployment> {
    return this.deploymentRepository.getDeploymentForCritterId(surveyId, critterId);
  }

  /**
   * Create a new deployment
   *
   * @param {ICreateSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentService
   */
  async insertDeployment(deployment: ICreateSurveyDeployment): Promise<void> {
    return this.deploymentRepository.insertDeployment(deployment);
  }

  /**
   * Update a deployment in SIMS
   *
   * @param {IUpdateSurveyDeployment} deployment
   * @return {*}  {Promise<string>}
   * @memberof DeploymentService
   */
  async updateDeployment(deployment: IUpdateSurveyDeployment): Promise<string> {
    return this.deploymentRepository.updateDeployment(deployment);
  }

  /**
   * Deletes the deployment in SIMS.
   *
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<{ bctw_deployment_id: string }>}
   * @memberof DeploymentService
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<{ bctw_deployment_id: string }> {
    return this.deploymentRepository.deleteDeployment(surveyId, deploymentId);
  }
}
