import { getKnex } from '../database/db';
import { IPostSurveyDeployment, SurveyDeployment } from '../models/survey-deployment';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/deployment');

/**
 * Repository layer for survey deployments
 *
 * @export
 * @class DeploymentRepository
 * @extends {BaseRepository}
 */
export class DeploymentRepository extends BaseRepository {
  /**
   * Returns deployments in a survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentRepository
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<SurveyDeployment[]> {
    defaultLog.debug({ label: 'getDeploymentsForSurveyId', surveyId });

    const queryBuilder = getKnex()
      .select(
        'deployment_id',
        'd.critter_id',
        'bctw_deployment_id',
        'critterbase_start_capture_id',
        'critterbase_end_capture_id',
        'critterbase_end_mortality_id'
      )
      .from('deployment as d')
      .leftJoin('critter as c', 'c.critter_id', 'd.critter_id')
      .where('c.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, SurveyDeployment);

    return response.rows;
  }

  /**
   * Insert a new deployment record.
   *
   * @param {IPostSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentRepository
   */
  async insertDeployment(deployment: IPostSurveyDeployment): Promise<void> {
    defaultLog.debug({ label: 'insertDeployment', deploymentId: deployment.bctw_deployment_id });

    const queryBuilder = getKnex().table('deployment').insert(deployment);

    await this.connection.knex(queryBuilder);
  }

  /**
   * Update an existing deployment record.
   *
   * @param {IPostSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentRepository
   */
  async updateDeployment(deployment: IPostSurveyDeployment): Promise<void> {
    defaultLog.debug({ label: 'updateDeployment', deploymentId: deployment.bctw_deployment_id });

    const queryBuilder = getKnex()
      .table('deployment')
      .where({
        bctw_deployment_id: deployment.bctw_deployment_id
      })
      .update(deployment);

    await this.connection.knex(queryBuilder);
  }

  /**
   * Deletes a deployment row.
   *
   * @param {number} critterId
   * @param {string} deploymentId
   * @return {*}  {Promise<void>}
   * @memberof DeploymentRepository
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    defaultLog.debug({ label: 'removeDeployment', deploymentId });

    const queryBuilder = getKnex()
      .table('deployment')
      .where({ critter_id: critterId, bctw_deployment_id: deploymentId })
      .delete();

    await this.connection.knex(queryBuilder);
  }
}
