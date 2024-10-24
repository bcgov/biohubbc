import SQL from 'sql-template-strings';
import { DeploymentRecord } from '../../database-models/deployment';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import {
  CreateDeployment,
  ExtendedDeploymentRecord,
  UpdateDeployment
} from './telemetry-deployment-repository.interface';

/**
 * Repository class for working with deployments.
 *
 * @export
 * @class TelemetryDeploymentRepository
 * @extends {BaseRepository}
 */
export class TelemetryDeploymentRepository extends BaseRepository {
  /**
   * Create a deployment.
   *
   * @param {CreateDeployment} deployment The deployment data to create
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentRepository
   */
  async createDeployment(deployment: CreateDeployment): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO deployment2 (
        survey_id,
        critter_id,
        device_id,
        frequency,
        frequency_unit_id,
        attachment_start_date,
        attachment_start_time,
        attachment_end_date,
        attachment_end_time,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      ) VALUES (
        ${deployment.survey_id},
        ${deployment.critter_id},
        ${deployment.device_id},
        ${deployment.frequency},
        ${deployment.frequency_unit_id},
        ${deployment.attachment_start_date},
        ${deployment.attachment_start_time},
        ${deployment.attachment_end_date},
        ${deployment.attachment_end_time},
        ${deployment.critterbase_start_capture_id},
        ${deployment.critterbase_end_capture_id},
        ${deployment.critterbase_end_mortality_id}
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to create deployment', [
        'TelemetryDeploymentRepository->createDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Get a deployment by its ID. Includes additional device and critter data.
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} deploymentIds A list of deployment IDs
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentRepository
   */
  async getDeploymentsByIds(surveyId: number, deploymentIds: number[]): Promise<ExtendedDeploymentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        -- deployment data
        deployment2.deployment2_id,
        deployment2.survey_id,
        deployment2.critter_id,
        deployment2.device_id,
        deployment2.frequency,
        deployment2.frequency_unit_id,
        deployment2.device_key,
        deployment2.attachment_start_date,
        deployment2.attachment_start_time,
        deployment2.attachment_start_timestamp,
        deployment2.attachment_end_date,
        deployment2.attachment_end_time,
        deployment2.attachment_end_timestamp,
        deployment2.critterbase_start_capture_id,
        deployment2.critterbase_end_capture_id,
        deployment2.critterbase_end_mortality_id,
        -- device data
        device.device_make_id,
        device.model,
        -- critter data
        critter.critterbase_critter_id
      FROM
        deployment2
      INNER JOIN
        device
          ON deployment2.device_id = device.device_id
      INNER JOIN
        critter
          ON deployment2.critter_id = critter.critter_id
      WHERE
        deployment2.deployment2_id = ANY (${deploymentIds})
      AND
        deployment2.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, ExtendedDeploymentRecord);

    return response.rows;
  }

  /**
   * Get deployments for a survey ID. Includes additional device and critter data.
   *
   * @param {number} surveyId The survey ID
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentRepository
   */
  async getDeploymentsForSurveyId(surveyId: number): Promise<ExtendedDeploymentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        -- deployment data
        deployment2.deployment2_id,
        deployment2.survey_id,
        deployment2.critter_id,
        deployment2.device_id,
        deployment2.frequency,
        deployment2.frequency_unit_id,
        deployment2.device_key,
        deployment2.attachment_start_date,
        deployment2.attachment_start_time,
        deployment2.attachment_start_timestamp,
        deployment2.attachment_end_date,
        deployment2.attachment_end_time,
        deployment2.attachment_end_timestamp,
        deployment2.critterbase_start_capture_id,
        deployment2.critterbase_end_capture_id,
        deployment2.critterbase_end_mortality_id,
        -- device data
        device.device_make_id,
        device.model,
        -- critter data
        critter.critterbase_critter_id
      FROM
        deployment2
      INNER JOIN
        device
          ON deployment2.device_id = device.device_id
      INNER JOIN
        critter
          ON deployment2.critter_id = critter.critter_id
      WHERE
        deployment2.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, ExtendedDeploymentRecord);

    return response.rows;
  }

  /**
   * Get deployments for a critter ID.
   *
   * @param {number} surveyId The survey ID
   * @param {number} critterId The critter ID
   * @return {*}  {Promise<DeploymentRecord[]>}
   * @memberof TelemetryDeploymentRepository
   */
  async getDeploymentsForCritterId(surveyId: number, critterId: number): Promise<DeploymentRecord[]> {
    const sqlStatement = SQL`
      SELECT
        deployment2_id,
        survey_id,
        critter_id,
        device_id,
        device_key,
        frequency,
        frequency_unit_id,
        attachment_start_date,
        attachment_start_time,
        attachment_start_timestamp,
        attachment_end_date,
        attachment_end_time,
        attachment_end_timestamp,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      FROM
        deployment2
      WHERE
        critter_id = ${critterId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, DeploymentRecord);

    return response.rows;
  }

  /**
   * Update a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deployment2_id The deployment ID
   * @param {UpdateDeployment} deployment The deployment data to update
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentRepository
   */
  async updateDeployment(surveyId: number, deployment2_id: number, deployment: UpdateDeployment): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        deployment2
      SET
        critter_id = ${deployment.critter_id},
        device_id = ${deployment.device_id},
        frequency = ${deployment.frequency},
        frequency_unit_id = ${deployment.frequency_unit_id},
        attachment_start_date = ${deployment.attachment_start_date},
        attachment_start_time = ${deployment.attachment_start_time},
        attachment_end_date = ${deployment.attachment_end_date},
        attachment_end_time = ${deployment.attachment_end_time},
        critterbase_start_capture_id = ${deployment.critterbase_start_capture_id},
        critterbase_end_capture_id = ${deployment.critterbase_end_capture_id},
        critterbase_end_mortality_id = ${deployment.critterbase_end_mortality_id}
      WHERE
        deployment2_id = ${deployment2_id} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update deployment', [
        'TelemetryDeploymentRepository->updateDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Delete a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deploymentId The deployment ID
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentRepository
   */
  async deleteDeployment(surveyId: number, deploymentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        deployment2
      WHERE
        deployment2_id = ${deploymentId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete deployment', [
        'TelemetryDeploymentRepository->deleteDeployment',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Delete multiple deployments.
   *
   * @param {number} surveyId The survey ID
   * @param {number[]} deploymentIds The deployment IDs
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentRepository
   */
  async deleteDeployments(surveyId: number, deploymentIds: number[]): Promise<void> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .delete()
      .from('deployment2')
      .whereIn('deployment2_id', deploymentIds)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== deploymentIds.length) {
      throw new ApiExecuteSQLError('Failed to delete deployments', [
        'TelemetryDeploymentRepository->deleteDeployment',
        `rowCount was ${response.rowCount}, expected rowCount = ${deploymentIds.length}`
      ]);
    }
  }
}
