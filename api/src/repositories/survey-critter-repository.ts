import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IAnimalAdvancedFilters } from '../models/animal-view';
import { IAllTelemetryAdvancedFilters } from '../models/telemetry-view';
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
   * Get a specific critter by its integer Id
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterRepository
   */
  async getCritterById(surveyId: number, critterId: number): Promise<SurveyCritterRecord> {
    defaultLog.debug({ label: 'getCritterById', critterId });

    const queryBuilder = getKnex().table('critter').select().where({ survey_id: surveyId, critter_id: critterId });

    const response = await this.connection.knex(queryBuilder);

    return response.rows[0];
  }

  /**
   * Constructs a non-paginated query to retrieve critters that are available to the user based on the user's
   * permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IAnimalAdvancedFilters} [filterFields]
   * @return {*}
   * @memberof SurveyCritterRepository
   */
  _makeFindCrittersQuery(isUserAdmin: boolean, systemUserId: number | null, filterFields?: IAnimalAdvancedFilters) {
    const query = getKnex().select(['critter_id', 'survey_id', 'critterbase_critter_id']).from('critter');

    if (!isUserAdmin) {
      query
        .leftJoin('survey', 'survey.survey_id', 'critter.survey_id')
        .leftJoin('project', 'project.project_id', 'survey.project_id')
        .leftJoin('project_participation', 'project_participation.project_id', 'project.project_id')
        .where('project_participation.system_user_id', systemUserId);
    }

    if (filterFields?.system_user_id) {
      query.whereIn('p.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    return query;
  }

  /**
   * Retrieves all critters that are available to the user based on the user's permissions and filter criteria.
   *
   * Note: SIMS does not store critter information, beyond an ID. Critter details must be fetched from the external
   * Critterbase API.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAllTelemetryAdvancedFilters} [filterFields]
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterRepository
   */
  async findCritters(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAllTelemetryAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<SurveyCritterRecord[]> {
    const query = this._makeFindCrittersQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query);

    return response.rows;
  }

  /**
   * Retrieves the total count of all critters that are available to the user based on the user's permissions and
   * filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IAllTelemetryAdvancedFilters} [filterFields]
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterRepository
   */
  async findCrittersCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IAllTelemetryAdvancedFilters
  ): Promise<number> {
    const findCrittersQuery = this._makeFindCrittersQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    // See https://knexjs.org/guide/query-builder.html#usage-with-typescript-3 for details on count() usage
    const query = knex.from(findCrittersQuery.as('fcq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get critter count', [
        'SurveyCritterRepository->findCrittersCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
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
}
