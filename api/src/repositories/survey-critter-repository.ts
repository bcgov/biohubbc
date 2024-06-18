import { z } from 'zod';
import { getKnex } from '../database/db';
import { ITelemetryAdvancedFilters } from '../models/telemetry-view';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/survey-repository');

export const SurveyCritterRecord = z.object({
  critter_id: z.number(),
  survey_id: z.number(),
  critterbase_critter_id: z.string().uuid()
});

export type SurveyCritterRecord = z.infer<typeof SurveyCritterRecord>;

/**
 * Repository layer for survey critters.
 *
 * @export
 * @class SurveyCritterRepository
 * @extends {BaseRepository}
 */
export class SurveyCritterRepository extends BaseRepository {
  /**
   * Get critters in this survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterRepository
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    defaultLog.debug({ label: 'getCrittersInSurvey', surveyId });

    const queryBuilder = getKnex().table('critter').select().where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    return response.rows;
  }

  /**
   * Retrieves all critters that are available to the user based on the user's permissions and search criteria.
   *
   * Note: SIMS does not store critter information, beyond an ID. Critter details must be fetched from the external
   * CritterBase API.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {ITelemetryAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterRepository
   */
  async findCritters(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: ITelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyCritterRecord[]> {
    defaultLog.debug({ label: 'getCrittersInSurvey', systemUserId });

    const query = getKnex().select(['critter_id', 'survey_id', 'critterbase_critter_id']).from('critter');

    if (!isUserAdmin) {
      query
        .leftJoin('survey', 'survey.survey_id', 'critter.survey_id')
        .leftJoin('project', 'project.project_id', 'survey.project_id')
        .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    // Ensure that only administrators can filter surveys by other users.
    if (isUserAdmin) {
      if (filterFields.system_user_id) {
        query.whereIn('p.project_id', (subQueryBuilder) => {
          subQueryBuilder
            .select('project_id')
            .from('project_participation')
            .where('system_user_id', filterFields.system_user_id);
        });
      }
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, SurveyCritterRecord);

    return response.rows;
  }

  /**
   * Add critter to survey
   *
   * @param {number} surveyId
   * @param {string} critterId
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterRepository
   */
  async addCritterToSurvey(surveyId: number, critterId: string): Promise<number> {
    defaultLog.debug({ label: 'addCritterToSurvey', surveyId });

    const queryBuilder = getKnex()
      .table('critter')
      .insert({ survey_id: surveyId, critterbase_critter_id: critterId })
      .returning('critter_id');

    const response = await this.connection.knex(queryBuilder);

    return response.rows[0].critter_id;
  }

  /**
   * Updates the critterbase_critter_id for a critter.
   *
   * @param {number} critterId
   * @param {string} critterbaseCritterId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async updateCritter(critterId: number, critterbaseCritterId: string): Promise<void> {
    defaultLog.debug({ label: 'updateCritter', critterId });

    const queryBuilder = getKnex()
      .table('critter')
      .update({ critterbase_critter_id: critterbaseCritterId })
      .where({ critter_id: critterId });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Removes critters from the survey.
   *
   * @param {number} surveyId
   * @param {number[]} critterIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async removeCrittersFromSurvey(surveyId: number, critterIds: number[]): Promise<void> {
    defaultLog.debug({ label: 'removeCrittersFromSurvey', critterIds });

    const queryBuilder = getKnex()
      .delete()
      .from('critter')
      .whereIn('critter_id', critterIds)
      .andWhere({ survey_id: surveyId });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Will insert a new critter - deployment uuid association, or update if it already exists.
   * This update operation intentionally changes nothing. Only really being done to trigger update audit columns.
   *
   * @param {number} critterId
   * @param {string} deplyomentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async upsertDeployment(critterId: number, deplyomentId: string): Promise<void> {
    defaultLog.debug({ label: 'addDeployment', deplyomentId });

    const queryBuilder = getKnex()
      .table('deployment')
      .insert({ critter_id: critterId, bctw_deployment_id: deplyomentId })
      .onConflict(['critter_id', 'bctw_deployment_id'])
      .merge(['critter_id', 'bctw_deployment_id']);

    await this.connection.knex(queryBuilder);
  }

  /**
   * Deletes a deployment row.
   *
   * @param {number} critterId
   * @param {string} deploymentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
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
