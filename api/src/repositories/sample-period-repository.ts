import { Knex } from 'knex';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { MethodTechniqueRecord } from '../database-models/method_technique';
import { SurveySamplePeriodModel, SurveySamplePeriodRecord } from '../database-models/survey_sample_period';
import { SurveySampleSiteRecord } from '../database-models/survey_sample_site';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { IPeriodAdvancedFilters } from '../models/period-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * Insert object for a single sample period record.
 */
export type InsertSamplePeriodObject = Pick<
  SurveySamplePeriodRecord,
  'survey_sample_site_id' | 'method_technique_id' | 'start_date' | 'end_date' | 'start_time' | 'end_time'
>;

/**
 * Update object for a single sample period record.
 */
export type UpdateSamplePeriodObject = SurveySamplePeriodRecord;

/**
 * Survey sample period record with basic details about the method and site.
 */
export const SurveySamplePeriodDetails = SurveySamplePeriodRecord.extend({
  survey_sample_site: SurveySampleSiteRecord.pick({
    survey_sample_site_id: true,
    name: true
  }).nullable(),
  method_technique: MethodTechniqueRecord.pick({
    method_technique_id: true,
    name: true,
    description: true,
    method_response_metric_id: true
  }).nullable()
});
export type SurveySamplePeriodDetails = z.infer<typeof SurveySamplePeriodDetails>;

export const FindSamplePeriodRecord = SurveySamplePeriodDetails;
export type FindSamplePeriodRecord = z.infer<typeof FindSamplePeriodRecord>;

/**
 * Sample Period Repository
 *
 * @export
 * @class SamplePeriodRepository
 * @extends {BaseRepository}
 */
export class SamplePeriodRepository extends BaseRepository {
  /**
   * Gets all survey Sample periods.
   *
   * @param {number[]} surveyIds
   * @param {{
   *       filterFields?: {
   *         surveyObservationIds?: number[];
   *       };
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*}  {Promise<SurveySamplePeriodDetails[]>}
   * @memberof SamplePeriodRepository
   */
  async getSamplePeriodsForSurveys(
    surveyIds: number[],
    options?: {
      filterFields?: {
        surveyObservationIds?: number[];
      };
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SurveySamplePeriodDetails[]> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder.modify(this._getSamplingPeriodBaseQuery);

    if (options?.filterFields?.surveyObservationIds) {
      queryBuilder
        .innerJoin(
          'survey_observation',
          'survey_observation.survey_sample_period_id',
          'survey_sample_period.survey_sample_period_id'
        )
        .whereIn('survey_observation.survey_observation_id', options.filterFields.surveyObservationIds);
    }

    queryBuilder.whereIn('survey_sample_period.survey_id', surveyIds);

    if (options?.pagination) {
      queryBuilder.limit(options.pagination.limit).offset((options.pagination.page - 1) * options.pagination.limit);

      if (options.pagination.sort && options.pagination.order) {
        queryBuilder.orderBy(options.pagination.sort, options.pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, SurveySamplePeriodDetails);

    return response.rows;
  }

  /**
   * Gets count of all survey Sample periods.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SamplePeriodRepository
   */
  async getSamplePeriodsCountForSurvey(surveyId: number): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .select('count(*)::integer as count')
      .from('survey_sample_period')
      .leftJoin('method_technique', 'method_technique.method_technique_id', 'survey_sample_period.method_technique_id')
      .leftJoin(
        'survey_sample_site',
        'survey_sample_period.survey_sample_site_id',
        'survey_sample_site.survey_sample_site_id'
      )
      .where('survey_sample_site.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Gets all survey Sample periods for a given observation.
   *
   * @param {number[]} surveyIds
   * @param {number} surveyObservationId
   * @return {*}  {Promise<SurveySamplePeriodDetails[]>}
   * @memberof SamplePeriodRepository
   */
  async getSamplePeriodsForObservation(
    surveyIds: number[],
    surveyObservationId: number
  ): Promise<SurveySamplePeriodDetails[]> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder.modify(this._getSamplingPeriodBaseQuery);

    // Only return periods that are associated with the given observation and survey
    queryBuilder
      .innerJoin(
        'survey_observation',
        'survey_observation.survey_sample_period_id',
        'survey_sample_period.survey_sample_period_id'
      )
      .where('survey_observation.survey_observation_id', surveyObservationId)
      .whereIn('survey_observation.survey_id', surveyIds);

    const response = await this.connection.knex(queryBuilder, SurveySamplePeriodDetails);

    return response.rows;
  }

  /**
   * Gets a sample period record by its ID
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SurveySamplePeriodDetails>}
   * @memberof SampleSiteService
   */
  async getSamplePeriodById(surveyId: number, surveySamplePeriodId: number): Promise<SurveySamplePeriodDetails> {
    const sqlStatement = SQL`
      SELECT
        survey_sample_period.survey_sample_period_id,
        survey_sample_period.survey_id,
        survey_sample_period.survey_sample_site_id,
        survey_sample_period.method_technique_id,
        survey_sample_period.start_date,
        survey_sample_period.end_date,
        survey_sample_period.start_time,
        survey_sample_period.end_time,
        CASE 
          WHEN 
            survey_sample_period.survey_sample_site_id IS NULL 
          THEN 
            NULL
          ELSE
            jsonb_build_object(
              'survey_sample_site_id', survey_sample_site.survey_sample_site_id,
              'name', survey_sample_site.name
            )
        END AS survey_sample_site,
        CASE 
          WHEN 
            survey_sample_period.method_technique_id IS NULL 
          THEN 
            NULL
          ELSE
            jsonb_build_object(
              'method_technique_id', method_technique.method_technique_id,
              'method_response_metric_id', method_technique.method_response_metric_id,
              'name', method_technique.name,
              'description', method_technique.description
            )
        END AS method_technique
      FROM
        survey_sample_period
      LEFT JOIN
        survey_sample_site ON survey_sample_site.survey_sample_site_id = survey_sample_period.survey_sample_site_id
      LEFT JOIN
        method_technique ON method_technique.method_technique_id = survey_sample_period.method_technique_id
      WHERE 
        survey_sample_period.survey_id = ${surveyId}
      AND 
        survey_sample_period.survey_sample_period_id = ${surveySamplePeriodId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveySamplePeriodDetails);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get sample period by ID', [
        'SampleSiteRepository->getSamplePeriodById',
        'rowCount was < 1, expected rowCount > 0'
      ]);
    }

    return response.rows[0];
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {number} surveyId
   * @param {UpdateSamplePeriodObject} samplePeriod
   * @return {*}  {Promise<void>}
   * @memberof SamplePeriodRepository
   */
  async updateSamplePeriod(surveyId: number, samplePeriod: UpdateSamplePeriodObject): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .update({
        survey_sample_site_id: samplePeriod.survey_sample_site_id,
        method_technique_id: samplePeriod.method_technique_id,
        start_date: samplePeriod.start_date,
        end_date: samplePeriod.end_date,
        start_time: samplePeriod.start_time,
        end_time: samplePeriod.end_time
      })
      .from('survey_sample_period');

    if (samplePeriod.survey_sample_site_id) {
      queryBuilder.whereExists(
        // If a non-null survey_sample_site_id is provided, only update the period if the survey_sample_site_id is
        // valid for the survey
        knex
          .select(1)
          .from('survey_sample_site')
          .where('survey_sample_site_id', samplePeriod.survey_sample_site_id)
          .andWhere('survey_id', surveyId)
      );
    }

    if (samplePeriod.method_technique_id) {
      // If a non-null method_technique_id is provided, only update the period if the method_technique_id is valid for
      // the survey
      queryBuilder.whereExists(
        knex
          .select(1)
          .from('method_technique')
          .where('method_technique_id', samplePeriod.method_technique_id)
          .andWhere('survey_id', surveyId)
      );
    }

    queryBuilder
      .andWhere('survey_sample_period_id', samplePeriod.survey_sample_period_id)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, SurveySamplePeriodModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update sample period', [
        'SamplePeriodRepository->updateSamplePeriod',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return;
  }

  /**
   * Inserts a new survey Sample Period.
   *
   * @param {number} surveyId
   * @param {InsertSamplePeriodObject} samplePeriod
   * @return {*}  {Promise<SurveySamplePeriodModel>}
   * @memberof SamplePeriodRepository
   */
  async insertSamplePeriod(surveyId: number, samplePeriod: InsertSamplePeriodObject): Promise<SurveySamplePeriodModel> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .insert({
        survey_sample_site_id: samplePeriod.survey_sample_site_id,
        survey_id: surveyId,
        method_technique_id: samplePeriod.method_technique_id,
        start_date: samplePeriod.start_date,
        end_date: samplePeriod.end_date,
        start_time: samplePeriod.start_time,
        end_time: samplePeriod.end_time
      })
      .into('survey_sample_period')
      .whereExists(
        // Only insert if the survey_sample_site_id is valid for the survey
        knex
          .select(1)
          .from('survey_sample_site')
          .where('survey_sample_site_id', samplePeriod.survey_sample_site_id)
          .andWhere('survey_id', surveyId)
      )
      // Only insert if the method_technique_id is valid for the survey
      .whereExists(
        knex
          .select(1)
          .from('method_technique')
          .where('method_technique_id', samplePeriod.method_technique_id)
          .andWhere('survey_id', surveyId)
      );

    const response = await this.connection.knex(queryBuilder);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert survey sample period', [
        'SamplePeriodRepository->insertSamplePeriod',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get the base query for retrieving survey sample periods.
   *
   * @param {Knex.QueryBuilder} queryBuilder
   * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey sample periods.
   * @memberof SamplePeriodRepository
   */
  _getSamplingPeriodBaseQuery(queryBuilder: Knex.QueryBuilder): Knex.QueryBuilder {
    const knex = getKnex();

    queryBuilder
      .select(
        'survey_sample_period.survey_sample_period_id',
        'survey_sample_period.survey_id',
        'survey_sample_period.survey_sample_site_id',
        'survey_sample_period.method_technique_id',
        'survey_sample_period.start_date',
        'survey_sample_period.start_time',
        'survey_sample_period.end_date',
        'survey_sample_period.end_time',
        knex.raw(`
          CASE 
            WHEN 
              survey_sample_period.survey_sample_site_id IS NULL 
            THEN 
              NULL
            ELSE
              jsonb_build_object(
                'survey_sample_site_id', survey_sample_site.survey_sample_site_id,
                'name', survey_sample_site.name
              )
          END AS survey_sample_site
        `),
        knex.raw(`
          CASE 
            WHEN 
              survey_sample_period.method_technique_id IS NULL 
            THEN 
              NULL
            ELSE
              jsonb_build_object(
                'method_technique_id', method_technique.method_technique_id,
                'method_response_metric_id', method_technique.method_response_metric_id,
                'name', method_technique.name,
                'description', method_technique.description
              )
          END AS method_technique
        `)
      )
      .from('survey_sample_period')
      .leftJoin(
        'survey_sample_site',
        'survey_sample_site.survey_sample_site_id',
        'survey_sample_period.survey_sample_site_id'
      )
      .leftJoin('method_technique', 'method_technique.method_technique_id', 'survey_sample_period.method_technique_id');

    return queryBuilder;
  }

  /**
   * Get the base query for retrieving survey sample periods.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IPeriodAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder} The base query for retrieving survey sample periods
   * @memberof SamplePeriodRepository
   */
  _makeFindSamplingPeriodBaseQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IPeriodAdvancedFilters
  ): Knex.QueryBuilder {
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
      getSurveyIdsQuery.whereIn('project.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    const getSamplingPeriodsQuery = knex.queryBuilder();

    // Add the base query
    getSamplingPeriodsQuery.modify(this._getSamplingPeriodBaseQuery);

    // Filter by the survey ids the user has access to
    getSamplingPeriodsQuery.whereIn('survey_sample_period.survey_id', getSurveyIdsQuery);

    if (filterFields.survey_id) {
      // Filter by a specific survey id
      getSamplingPeriodsQuery.andWhere('survey_sample_period.survey_id', filterFields.survey_id);
    }

    if (filterFields.sample_site_id?.length) {
      // Filter by a specific sample site id
      getSamplingPeriodsQuery.whereIn('survey_sample_period.survey_sample_site_id', filterFields.sample_site_id);
    }

    if (filterFields.method_technique_id?.length) {
      // Filter by a specific sample method id
      getSamplingPeriodsQuery.whereIn('survey_sample_period.method_technique_id', filterFields.method_technique_id);
    }

    return getSamplingPeriodsQuery;
  }

  /**
   * Retrieve the list of periods that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {IPeriodAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {*}  {Promise<FindSamplePeriodRecord[]>}
   * @memberof SamplePeriodRepository
   */
  async findSamplePeriods(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IPeriodAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindSamplePeriodRecord[]> {
    const query = this._makeFindSamplingPeriodBaseQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindSamplePeriodRecord);

    return response.rows;
  }

  /**
   * Retrieve the count of periods that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {IPeriodAdvancedFilters} filterFields The filter fields to apply.
   * @return {*}  {Promise<number>}
   * @memberof SamplePeriodRepository
   */
  async findSamplePeriodsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IPeriodAdvancedFilters
  ): Promise<number> {
    const knex = getKnex();

    const findPeriodsQuery = this._makeFindSamplingPeriodBaseQuery(isUserAdmin, systemUserId, filterFields);

    const query = knex.from(findPeriodsQuery.as('fpq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Deletes a survey Sample Period.
   *
   * @param {number} surveyId
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<void>}
   * @memberof SamplePeriodRepository
   */
  async deleteSamplePeriod(surveyId: number, surveySamplePeriodId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE
      FROM
        survey_sample_period
      WHERE
        survey_sample_period.survey_sample_period_id = ${surveySamplePeriodId}
      AND
        survey_sample_period.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response?.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete sample period', [
        'SamplePeriodRepository->deleteSamplePeriod',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return;
  }

  /**
   * Deletes multiple Survey Sample Periods for a given array of period ids.
   *
   * @param {number[]} periodsToDelete an array of period ids to delete
   * @returns {*} {Promise<void>}
   * @memberof SamplePeriodRepository
   */
  async deleteSamplePeriods(surveyId: number, periodsToDelete: number[]): Promise<void> {
    const knex = getKnex();

    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .delete()
      .from('survey_sample_period')
      .whereIn('survey_sample_period.survey_sample_period_id', periodsToDelete)
      .andWhere('survey_sample_period.survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    if (response?.rowCount !== periodsToDelete.length) {
      throw new ApiExecuteSQLError('Failed to delete sample periods', [
        'SamplePeriodRepository->deleteSamplePeriods',
        `rowCount was ${response.rowCount}, expected rowCount = ${periodsToDelete.length}`
      ]);
    }

    return;
  }
}
