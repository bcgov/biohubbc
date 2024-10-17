import { getKnex } from '../database/db';
import { ICreateSurveyDeployment, IUpdateSurveyDeployment, SurveyDeployment } from '../models/survey-deployment';
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
   * @return {*}  {Promise<SurveyDeployment>}
   * @memberof DeploymentRepository
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<SurveyDeployment[]> {
    defaultLog.debug({ label: 'getDeploymentsForSurveyId', surveyId });

    const queryBuilder = getKnex()
      .select(
        'deployment_id',
        'd.critter_id as critter_id',
        'c.critterbase_critter_id',
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
   * Returns a specific deployment
   *
   * @param {number} deploymentId
   * @return {*}  {Promise<SurveyDeployment>}
   * @memberof DeploymentRepository
   */
  async getDeploymentById(deploymentId: number): Promise<SurveyDeployment> {
    defaultLog.debug({ label: 'getDeploymentById', deploymentId });

    const queryBuilder = getKnex()
      .select(
        'deployment_id',
        'd.critter_id as critter_id',
        'c.critterbase_critter_id',
        'bctw_deployment_id',
        'critterbase_start_capture_id',
        'critterbase_end_capture_id',
        'critterbase_end_mortality_id'
      )
      .from('deployment as d')
      .leftJoin('critter as c', 'c.critter_id', 'd.critter_id')
      .where('d.deployment_id', deploymentId);

    const response = await this.connection.knex(queryBuilder, SurveyDeployment);

    return response.rows[0];
  }

  /**
   * Returns a specific deployment for a given critter Id
   *
   * WARNING: Should this return all deployments for a critter vs just the most recent?
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<SurveyDeployment>}
   * @memberof DeploymentRepository
   */
  async getDeploymentForCritterId(surveyId: number, critterId: number): Promise<SurveyDeployment> {
    defaultLog.debug({ label: 'getDeploymentById', critterId });

    const queryBuilder = getKnex()
      .select(
        'deployment_id',
        'd.critter_id as critter_id',
        'c.critterbase_critter_id',
        'bctw_deployment_id',
        'critterbase_start_capture_id',
        'critterbase_end_capture_id',
        'critterbase_end_mortality_id'
      )
      .from('deployment as d')
      .leftJoin('critter as c', 'c.critter_id', 'd.critter_id')
      .where('d.critter_id', critterId)
      .andWhere('c.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, SurveyDeployment);

    return response.rows[0];
  }

  /**
   * Insert a new deployment record.
   *
   * @param {ICreateSurveyDeployment} deployment
   * @return {*}  {Promise<void>}
   * @memberof DeploymentRepository
   */
  async insertDeployment(deployment: ICreateSurveyDeployment): Promise<void> {
    defaultLog.debug({ label: 'insertDeployment', bctw_deployment_id: deployment.bctw_deployment_id });

    const queryBuilder = getKnex().table('deployment').insert({
      critter_id: deployment.critter_id,
      bctw_deployment_id: deployment.bctw_deployment_id,
      critterbase_start_capture_id: deployment.critterbase_start_capture_id,
      critterbase_end_capture_id: deployment.critterbase_end_capture_id,
      critterbase_end_mortality_id: deployment.critterbase_end_mortality_id
    });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Update an existing deployment record.
   *
   * @param {IUpdateSurveyDeployment} deployment
   * @return {*}  {Promise<string>}
   * @memberof DeploymentRepository
   */
  async updateDeployment(deployment: IUpdateSurveyDeployment): Promise<string> {
    defaultLog.debug({ label: 'updateDeployment', deployment_id: deployment.deployment_id });

    const queryBuilder = getKnex()
      .table('deployment')
      .where('deployment_id', deployment.deployment_id)
      .update({
        critter_id: deployment.critter_id,
        critterbase_start_capture_id: deployment.critterbase_start_capture_id,
        critterbase_end_capture_id: deployment.critterbase_end_capture_id,
        critterbase_end_mortality_id: deployment.critterbase_end_mortality_id
      })
      .returning('bctw_deployment_id');

    const response = await this.connection.knex(queryBuilder);

    return response.rows[0].bctw_deployment_id;
  }

  /**
   * Deletes a deployment row.
   *
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}
   * @memberof DeploymentRepository
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<{ bctw_deployment_id: string }> {
    defaultLog.debug({ label: 'deleteDeployment', deploymentId });

    const queryBuilder = getKnex()
      .table('deployment')
      .join('critter', 'deployment.critter_id', 'critter.critter_id')
      .where({
        'deployment.deployment_id': deploymentId,
        'critter.survey_id': surveyId
      })
      .delete()
      .returning('bctw_deployment_id');

    const response = await this.connection.knex(queryBuilder);

    return response.rows[0];
  }
}
