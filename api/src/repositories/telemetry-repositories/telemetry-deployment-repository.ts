import SQL from 'sql-template-strings';
import { z } from 'zod';
import { DeploymentRecord } from '../../database-models/deployment';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IDeploymentAdvancedFilters } from '../../models/deployment-view';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
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
      INSERT INTO deployment (
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
    const knex = getKnex();

    const queryBuilder = knex
      .queryBuilder()
      .select(
        // deployment data
        'deployment.deployment_id',
        'deployment.survey_id',
        'deployment.critter_id',
        'deployment.device_id',
        'deployment.device_key',
        'deployment.frequency',
        'deployment.frequency_unit_id',
        'deployment.attachment_start_date',
        'deployment.attachment_start_time',
        'deployment.attachment_start_timestamp',
        'deployment.attachment_end_date',
        'deployment.attachment_end_time',
        'deployment.attachment_end_timestamp',
        'deployment.critterbase_start_capture_id',
        'deployment.critterbase_end_capture_id',
        'deployment.critterbase_end_mortality_id',
        // device data
        'device.serial',
        'device.device_make_id',
        'device.model',
        // critter data
        'critter.critterbase_critter_id'
      )
      .from('deployment')
      .innerJoin('survey', 'deployment.survey_id', 'survey.survey_id')
      .innerJoin('device', 'deployment.device_id', 'device.device_id')
      .innerJoin('critter', 'deployment.critter_id', 'critter.critter_id')
      .where('deployment.survey_id', surveyId);

    if (deploymentIds?.length) {
      // Filter results by deployment IDs
      queryBuilder.whereIn('deployment.deployment_id', deploymentIds);
    }

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, ExtendedDeploymentRecord);

    return response.rows;
  }

  /**
   * Retrieves the paginated list of all deployments that are available to the user, based on their permissions and
   * provided filter criteria.
   *
   * @param {boolean} isUserAdmin Whether the user making the request is an admin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IDeploymentAdvancedFilters} filterFields The filter fields to apply
   * @param {ApiPaginationOptions} [pagination] The pagination/sorting options to apply
   * @return {*}  {Promise<ExtendedDeploymentRecord[]>}
   * @memberof TelemetryDeploymentRepository
   */
  async findDeployments(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IDeploymentAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<ExtendedDeploymentRecord[]> {
    const knex = getKnex();

    const getSurveyIdsQuery = knex.select<any, { survey_id: number }>(['survey_id']).from('survey');

    // Ensure that users can only see observations that they are participating in, unless they are an administrator.
    if (!isUserAdmin) {
      getSurveyIdsQuery.whereIn('survey.project_id', (subqueryBuilder) =>
        subqueryBuilder
          .select('project.project_id')
          .from('project')
          .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
          .where('project_participation.system_user_id', systemUserId)
      );
    }

    if (filterFields.system_user_id) {
      getSurveyIdsQuery.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    const queryBuilder = knex
      .queryBuilder()
      .select(
        // deployment data
        'deployment.deployment_id',
        'deployment.survey_id',
        'deployment.critter_id',
        'deployment.device_id',
        'deployment.device_key',
        'deployment.frequency',
        'deployment.frequency_unit_id',
        'deployment.attachment_start_date',
        'deployment.attachment_start_time',
        'deployment.attachment_start_timestamp',
        'deployment.attachment_end_date',
        'deployment.attachment_end_time',
        'deployment.attachment_end_timestamp',
        'deployment.critterbase_start_capture_id',
        'deployment.critterbase_end_capture_id',
        'deployment.critterbase_end_mortality_id',
        // device data
        'device.serial',
        'device.device_make_id',
        'device.model',
        // critter data
        'critter.critterbase_critter_id'
      )
      .from('deployment')
      .innerJoin('survey', 'deployment.survey_id', 'survey.survey_id')
      .innerJoin('device', 'deployment.device_id', 'device.device_id')
      .innerJoin('critter', 'deployment.critter_id', 'critter.critter_id')
      .whereIn('deployment.survey_id', getSurveyIdsQuery);

    if (filterFields.survey_ids?.length) {
      // Filter results by survey IDs
      queryBuilder.whereIn('survey.survey_id', filterFields.survey_ids);
    }

    if (filterFields.deployment_ids?.length) {
      // Filter results by deployment IDs
      queryBuilder.whereIn('deployment.deployment_id', filterFields.deployment_ids);
    }

    if (filterFields.system_user_id) {
      // If a system user ID is provided, filter results by the projects/surveys that user has access to
      queryBuilder.whereIn('survey.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    // Add filtering based on additional filter fields
    if (filterFields.keyword) {
      queryBuilder.where((builder) => {
        builder
          .orWhere('device.serial', 'ilike', `%${filterFields.keyword}%`)
          .orWhere('critter.critterbase_critter_id', 'ilike', `%${filterFields.keyword}%`);
      });
    }

    if (filterFields.device_serial) {
      queryBuilder.where('device.serial', 'ilike', `%${filterFields.device_serial}%`);
    }

    if (filterFields.animal_alias) {
      queryBuilder.where('critter.critterbase_critter_id', 'ilike', `%${filterFields.animal_alias}%`);
    }

    if (filterFields.itis_tsn) {
      // Join with survey to get species information if needed
      queryBuilder
        .leftJoin('survey_species', 'survey.survey_id', 'survey_species.survey_id')
        .where('survey_species.itis_tsn', filterFields.itis_tsn);
    }

    if (filterFields.start_date) {
      queryBuilder.where('deployment.attachment_start_date', '>=', filterFields.start_date);
    }

    if (filterFields.end_date) {
      queryBuilder.where('deployment.attachment_start_date', '<=', filterFields.end_date);
    }

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, ExtendedDeploymentRecord);

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
        deployment_id,
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
        deployment
      WHERE
        critter_id = ${critterId} AND
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, DeploymentRecord);

    return response.rows;
  }

  /**
   * Get the total count of all deployments for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof TelemetryDeploymentRepository
   */
  async getDeploymentsCount(surveyId: number): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(knex.raw('count(*)::integer as count'))
      .from('deployment')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }
  /**
   * Update a deployment.
   *
   * @param {number} surveyId The survey ID
   * @param {number} deployment_id The deployment ID
   * @param {UpdateDeployment} deployment The deployment data to update
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeploymentRepository
   */
  async updateDeployment(surveyId: number, deployment_id: number, deployment: UpdateDeployment): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        deployment
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
        deployment_id = ${deployment_id} AND
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
        deployment
      WHERE
        deployment_id = ${deploymentId} AND
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
      .from('deployment')
      .whereIn('deployment_id', deploymentIds)
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
