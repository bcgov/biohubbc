import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { SurveyObservationModel, SurveyObservationRecord } from '../../database-models/survey_observation';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import {
  FlattenedObservationRecordWithSamplingAndSubcountData,
  InsertSurveyObservation,
  ObservationGeometryRecord,
  ObservationRecordWithSampling,
  ObservationRecordWithSamplingAndSubcountData,
  ObservationSpecies,
  UpdateSurveyObservation
} from './observation-repository.interface';
import {
  getSurveyFlattenedObservationsBaseQuery,
  getSurveyObservationsBaseQuery,
  makeFindFlattenedObservationsQuery,
  makeFindObservationsQuery
} from './utils';

export class ObservationRepository extends BaseRepository {
  /** Retrieve the list of observations that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {IObservationAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<ObservationRecordWithSamplingAndSubcountData[]>} A promise resolving to the list of observations.
   */
  async findObservations(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IObservationAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<ObservationRecordWithSamplingAndSubcountData[]> {
    const query = makeFindObservationsQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, ObservationRecordWithSamplingAndSubcountData);

    return response.rows;
  }

  /** Retrieve the list of observations that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {IObservationAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]>} A promise resolving to the list of observations.
   */
  async findFlattenedObservations(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields?: IObservationAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]> {
    const query = makeFindFlattenedObservationsQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        if (pagination.sort === 'subcount') {
          const knex = getKnex();
          query.orderByRaw(knex.raw(`(subcount->>?)::numeric ${pagination.order}`, [pagination.sort]));
        } else {
          query.orderBy(pagination.sort, pagination.order);
        }
      }
    }

    const response = await this.connection.knex(query, FlattenedObservationRecordWithSamplingAndSubcountData);

    return response.rows;
  }

  /**
   * Get an existing survey observation record, for a survey.
   *
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<ObservationRecordWithSamplingAndSubcountData>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationByIdWithSupplementaryData(
    surveyId: number,
    surveyObservationId: number
  ): Promise<ObservationRecordWithSamplingAndSubcountData> {
    const knex = getKnex();

    const getSurveyIdsQuery = knex
      .select<any, { survey_id: number }>('survey_id')
      .from('survey')
      .where('survey_id', surveyId);

    const query = getSurveyObservationsBaseQuery(knex, getSurveyIdsQuery);

    query.where('survey_observation.survey_observation_id', surveyObservationId);

    const response = await this.connection.knex(query, ObservationRecordWithSamplingAndSubcountData);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get survey observation', [
        'ObservationRepository->getSurveyObservationByIdWithSupplementaryData',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Retrieves a paginated set of observation records for the given survey, including data for
   * associated sampling records.
   *
   * @param {number} surveyId The ID of the survey.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<ObservationRecordWithSamplingAndSubcountData[]>} A promise resolving to the list of observations.
   * @memberof ObservationRepository
   */
  async getSurveyObservations(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<ObservationRecordWithSamplingAndSubcountData[]> {
    const knex = getKnex();

    const query = getSurveyObservationsBaseQuery(
      knex,
      knex.select<any, { survey_id: number }>('survey_id').from('survey').where('survey_id', surveyId)
    );

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, ObservationRecordWithSamplingAndSubcountData);

    return response.rows;
  }

  /**
   * Retrieves a paginated set of flattened observation records for the given survey, including data for
   * associated sampling records.
   *
   * @param {number} surveyId The ID of the survey.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]>} A promise resolving to the list of observations.
   * @memberof ObservationRepository
   */
  async getSurveyFlattenedObservations(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<FlattenedObservationRecordWithSamplingAndSubcountData[]> {
    const knex = getKnex();

    const query = getSurveyFlattenedObservationsBaseQuery(
      knex,
      knex.select<any, { survey_id: number }>('survey_id').from('survey').where('survey_id', surveyId)
    );

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        if (pagination.sort === 'subcount') {
          const knex = getKnex();
          query.orderByRaw(knex.raw(`(subcount->>?)::numeric ${pagination.order}`, [pagination.sort]));
        } else {
          query.orderBy(pagination.sort, pagination.order);
        }
      }
    }

    const response = await this.connection.knex(query, FlattenedObservationRecordWithSamplingAndSubcountData);

    return response.rows;
  }

  /**
   * Deletes all survey observation records associated with the given survey, except
   * for records whose ID belongs to the given array, then returns the count of
   * affected rows.
   *
   * @param {number} surveyId
   * @param {number[]} retainedObservationIds Observation records to retain (not be deleted)
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsNotInArray(surveyId: number, retainedObservationIds: number[]): Promise<number> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_observation
      WHERE
        survey_id = ${surveyId}
    `;

    if (retainedObservationIds.length) {
      sqlStatement.append(`
        AND
          survey_observation_id
        NOT IN
          (${retainedObservationIds.join(',')})
      `);
    }

    sqlStatement.append(';');

    const response = await this.connection.sql(sqlStatement);

    return response.rowCount ?? 0;
  }

  /**
   * Inserts a survey observation record.
   *
   * @param {number} surveyId
   * @param {InsertSurveyObservation} observation
   * @return {*}  {Promise<SurveyObservationRecord>}
   * @memberof ObservationRepository
   */
  async insertSurveyObservation(
    surveyId: number,
    observation: InsertSurveyObservation
  ): Promise<SurveyObservationRecord> {
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation
      (
        survey_id,
        itis_tsn,
        itis_scientific_name,
        survey_sample_period_id,
        latitude,
        longitude,
        count,
        observation_date,
        observation_time,
        observation_sign_id
      )
      VALUES
      (
        ${surveyId},
        ${observation.standardColumns.itis_tsn},
        ${observation.standardColumns.itis_scientific_name ?? null},
        ${observation.standardColumns.survey_sample_period_id ?? null},
        ${observation.standardColumns.latitude ?? null},
        ${observation.standardColumns.longitude ?? null},
        ${observation.standardColumns.count},
        ${observation.standardColumns.observation_date ?? null},
        ${observation.standardColumns.observation_time ?? null},
        ${observation.standardColumns.observation_sign_id ?? null}
      )
      RETURNING   
        survey_observation_id,
        survey_id,
        itis_tsn,
        itis_scientific_name,
        survey_sample_period_id,
        latitude,
        longitude,
        count,
        observation_time,
        observation_date,
        observation_sign_id;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyObservationRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation record', [
        'ObservationRepository->insertSurveyObservation',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Updates a survey observation record.
   *
   * @param {number} surveyId
   * @param {UpdateSurveyObservation} observation
   * @return {*}  {Promise<SurveyObservationRecord>}
   * @memberof ObservationRepository
   */
  async updateSurveyObservation(
    surveyId: number,
    observation: UpdateSurveyObservation
  ): Promise<SurveyObservationRecord> {
    const sqlStatement = SQL`
      UPDATE
        survey_observation
      SET
        itis_tsn = ${observation.standardColumns.itis_tsn},
        itis_scientific_name = ${observation.standardColumns.itis_scientific_name ?? null},
        survey_sample_period_id = ${observation.standardColumns.survey_sample_period_id ?? null},
        latitude = ${observation.standardColumns.latitude ?? null},
        longitude = ${observation.standardColumns.longitude ?? null},
        count = ${observation.standardColumns.count},
        observation_date = ${observation.standardColumns.observation_date ?? null},
        observation_time = ${observation.standardColumns.observation_time ?? null},
        observation_sign_id = ${observation.standardColumns.observation_sign_id ?? null}
      WHERE
        survey_observation_id = ${observation.standardColumns.survey_observation_id}
      AND 
        survey_id = ${surveyId}
      RETURNING   
        survey_observation_id,
        survey_id,
        itis_tsn,
        itis_scientific_name,
        survey_sample_period_id,
        latitude,
        longitude,
        count,
        observation_time,
        observation_date,
        observation_sign_id;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyObservationRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update observation record', [
        'ObservationRepository->insertSurveyObservation',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets a set of GeoJson geometries representing the set of all lat/long points for the
   * given survey's observations.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationGeometryRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationsGeometry(surveyId: number): Promise<ObservationGeometryRecord[]> {
    const knex = getKnex();

    const query = knex
      .select(
        'survey_observation_id',
        knex.raw("JSON_BUILD_OBJECT('type', 'Point', 'coordinates', JSON_BUILD_ARRAY(longitude, latitude)) as geometry")
      )
      .from('survey_observation')
      // TODO: For observations without lat/lon, get a location from the sampling site?
      .whereNotNull('latitude')
      .whereNotNull('longitude')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(query, ObservationGeometryRecord);

    return response.rows;
  }

  /**
   * Retrieves a single observation record
   *
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<ObservationRecordWithSampling[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(
    surveyId: number,
    surveyObservationId: number
  ): Promise<ObservationRecordWithSampling> {
    const knex = getKnex();
    const query = knex
      .queryBuilder()
      .select([
        // Observation data
        'survey_observation.survey_observation_id',
        'survey_observation.survey_id',
        'survey_observation.itis_tsn',
        'survey_observation.itis_scientific_name',
        'survey_observation.survey_sample_period_id',
        'survey_observation.latitude',
        'survey_observation.longitude',
        'survey_observation.count',
        'survey_observation.observation_time',
        'survey_observation.observation_date',
        'survey_observation.observation_sign_id',
        // Additional sampling data
        'survey_sample_period.survey_sample_site_id',
        'survey_sample_site.name as survey_sample_site_name',
        'survey_sample_period.method_technique_id',
        'method_technique.name as method_technique_name',
        knex.raw(`
          (survey_sample_period.start_date::date + COALESCE(survey_sample_period.start_time, '00:00:00')::time)::timestamp as survey_sample_period_start_datetime
        `)
      ])
      .from('survey_observation')
      .leftJoin(
        'survey_sample_period',
        'survey_observation.survey_sample_period_id',
        'survey_sample_period.survey_sample_period_id'
      )
      .leftJoin(
        'survey_sample_site',
        'survey_sample_site.survey_sample_site_id',
        'survey_sample_period.survey_sample_site_id'
      )
      .leftJoin('method_technique', 'method_technique.method_technique_id', 'survey_sample_period.method_technique_id')
      .where('survey_observation_id', surveyObservationId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query, ObservationRecordWithSampling);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get observation record', [
        'ObservationRepository->getSurveyObservationById',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getAllSurveyObservations(surveyId: number): Promise<SurveyObservationRecord[]> {
    const knex = getKnex();
    const allRowsQuery = knex
      .queryBuilder()
      .select([
        'survey_observation_id',
        'survey_id',
        'itis_tsn',
        'itis_scientific_name',
        'survey_sample_period_id',
        'latitude',
        'longitude',
        'count',
        'observation_time',
        'observation_date',
        'observation_sign_id'
      ])
      .from('survey_observation')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(allRowsQuery, SurveyObservationRecord);
    return response.rows;
  }

  /**
   * Retrieves species observed in a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationSpecies[]>}
   * @memberof ObservationRepository
   */
  async getObservedSpeciesForSurvey(surveyId: number): Promise<ObservationSpecies[]> {
    const knex = getKnex();
    const allRowsQuery = knex
      .queryBuilder()
      .distinct('itis_tsn')
      .from('survey_observation')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(allRowsQuery, ObservationSpecies);
    return response.rows;
  }

  /**
   * Retrieves the count of survey observations for the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationsCount(surveyId: number): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(survey_observation_id)::integer as count'))
      .from('survey_observation')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Retrieves the count of flattened survey observations for the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getSurveyFlattenedObservationsCount(surveyId: number): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(observation_subcount_id)::integer as count'))
      .from('observation_subcount')
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .where('survey_observation.survey_id', surveyId);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * Retrieves the total count of all observations that are available to the user based on the user's permissions and
   * filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IObservationAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async findObservationsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters
  ): Promise<number> {
    const findObservationsQuery = makeFindObservationsQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    const queryBuilder = knex.from(findObservationsQuery.as('foq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->findObservationsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Retrieves the total count of all flattened observations that are available to the user based on the user's
   * permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IObservationAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async findFlattenedObservationsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IObservationAdvancedFilters
  ): Promise<number> {
    const findFlattenedObservationsQuery = makeFindFlattenedObservationsQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    const queryBuilder = knex
      .from(findFlattenedObservationsQuery.as('foq'))
      .select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->findFlattenedObservationsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Deletes all survey observation records for the given observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsByIds(surveyId: number, observationIds: number[]): Promise<number> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .delete()
      .from('survey_observation')
      .whereIn('survey_observation_id', observationIds)
      .andWhere('survey_id', surveyId)
      .returning('*');

    const response = await this.connection.knex(queryBuilder, SurveyObservationModel);

    if (response.rowCount !== observationIds.length) {
      throw new ApiExecuteSQLError('Failed to delete observation records', [
        'ObservationRepository->deleteObservationsByIds',
        `rowCount was ${response.rowCount}, expected rowCount = ${observationIds.length}`
      ]);
    }

    return response.rowCount ?? 0;
  }

  /**
   * Retrieves observation records count for the given survey and sample site ids
   *
   * @param {number} surveyId
   * @param {number[]} sampleSiteIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySampleSiteIds(surveyId: number, sampleSiteIds: number[]): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(survey_observation_id)::integer as count'))
      .from('survey_observation')
      .leftJoin(
        'survey_sample_period',
        'survey_observation.survey_sample_period_id',
        'survey_sample_period.survey_sample_period_id'
      )
      .where('survey_observation.survey_id', surveyId)
      .whereIn('survey_sample_period.survey_sample_site_id', sampleSiteIds);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    if (response?.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->getObservationsCountBySampleSiteIds',
        'response.rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return Number(response.rows[0].count);
  }

  /**
   * Retrieves observation records count for the given survey and sample period ids
   *
   * @param {number[]} samplePeriodIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySamplePeriodIds(samplePeriodIds: number[]): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(survey_observation_id)::integer as count'))
      .from('survey_observation')
      .whereIn('survey_sample_period_id', samplePeriodIds);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    if (response?.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->getObservationsCountBySamplePeriodId',
        'response.rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Retrieves observation records count for the given survey and method technique ids.
   *
   * @param {number[]} methodTechniqueIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getObservationsCountByTechniqueIds(surveyId: number, methodTechniqueIds: number[]): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(survey_observation_id)::integer as count'))
      .from('survey_observation')
      .innerJoin(
        'survey_sample_method',
        'survey_observation.survey_sample_method_id',
        'survey_sample_method.survey_sample_method_id'
      )
      .where('survey_observation.survey_id', surveyId)
      .whereIn('survey_sample_method.method_technique_id', methodTechniqueIds);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    if (response?.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->getObservationsCountBySampleTechniqueId',
        'response.rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Build the survey export observation records query
   *
   * @static
   * @param {number} surveyId
   * @returns {SQLStatement}
   * @memberof ObservationRepository
   */
  static buildObservationQuery(surveyId: number): SQLStatement {
    return SQL`
      WITH aggregated_data AS (
          SELECT 
              so.survey_observation_id AS observation_id,
              osc.observation_subcount_id AS subcount_id,
              so.itis_tsn AS tsn,
              so.itis_scientific_name AS species,
              sss.name AS site,
              mt.name AS technique,
              ssp.start_date,
              ssp.end_date,
              os_sign.name AS sign,
              so.count,
              so.observation_date,
              so.observation_time,
              so.latitude,
              so.longitude,
              osc.comment,
              -- Aggregate qualitative measurements as JSON mh=meas header mv=meas value 
              jsonb_agg(
                  jsonb_build_object(
                      'mh', oscqm.critterbase_taxon_measurement_id::TEXT, 
                      'mv', oscqm.critterbase_measurement_qualitative_option_id::TEXT
                  )
              ) FILTER (
                  WHERE oscqm.critterbase_taxon_measurement_id IS NOT NULL AND 
                        oscqm.critterbase_measurement_qualitative_option_id IS NOT NULL
              ) AS meas_qual_data,
              -- Aggregate quantitative measurements as JSON
              jsonb_agg(
                  jsonb_build_object(
                      'mh', oscqmm.critterbase_taxon_measurement_id::TEXT, 
                      'mv', oscqmm.value::TEXT
                  )
              ) FILTER (
                  WHERE oscqmm.critterbase_taxon_measurement_id IS NOT NULL AND 
                        oscqmm.value IS NOT NULL
              ) AS meas_quan_data,
              -- Aggregate environmental qualitative data as JSON eh=environment header ev=environment value 
              jsonb_agg(
                  jsonb_build_object(
                      'eh', eq.name, 
                      'ev', eqo.name
                  )
              ) FILTER (
                  WHERE eq.name IS NOT NULL AND eqo.name IS NOT NULL
              ) AS env_qual_data,
              -- Aggregate environmental quantitative data as JSON
              jsonb_agg(
                  jsonb_build_object(
                      'eh', eqt.name, 
                      'ev', oscq.value
                  )
              ) FILTER (
                  WHERE eqt.name IS NOT NULL AND oscq.value IS NOT NULL
              ) AS env_quan_data
          FROM survey_observation so
          INNER JOIN observation_subcount osc ON so.survey_observation_id = osc.survey_observation_id
          LEFT JOIN survey_sample_period ssp ON so.survey_sample_period_id = ssp.survey_sample_period_id
          LEFT JOIN survey_sample_site sss ON ssp.survey_sample_site_id = sss.survey_sample_site_id
          LEFT JOIN method_technique mt ON ssp.method_technique_id = mt.method_technique_id
          LEFT JOIN observation_sign os_sign ON so.observation_sign_id = os_sign.observation_sign_id
          -- Joins for the environment data
        LEFT JOIN observation_environment_qualitative oequal ON oequal.survey_observation_id = so.survey_observation_id
        LEFT JOIN environment_qualitative eq ON eq.environment_qualitative_id = oequal.environment_qualitative_id
        LEFT JOIN environment_qualitative_option eqo ON eqo.environment_qualitative_option_id = oequal.environment_qualitative_option_id
        LEFT JOIN observation_environment_quantitative oscq ON oscq.survey_observation_id = so.survey_observation_id
        LEFT JOIN environment_quantitative eqt ON eqt.environment_quantitative_id = oscq.environment_quantitative_id
        -- Joins for the measurement data
          LEFT JOIN observation_subcount_qualitative_measurement oscqm ON osc.observation_subcount_id = oscqm.observation_subcount_id
          LEFT JOIN observation_subcount_quantitative_measurement oscqmm ON osc.observation_subcount_id = oscqmm.observation_subcount_id
          
          WHERE so.survey_id = ${surveyId}

          GROUP BY 
              so.survey_observation_id,
              osc.observation_subcount_id,
              so.itis_tsn,
              so.itis_scientific_name,
              sss.name,
              mt.name,
              ssp.start_date,
              ssp.end_date,
              os_sign.name,
              so.count,
              so.observation_date,
              so.observation_time,
              so.latitude,
              so.longitude,
              osc.comment
      ),
      unique_env_headers AS (
          SELECT 
              eq.name AS header_name,
              'qualitative' AS source
          FROM environment_qualitative eq
          WHERE EXISTS (
              SELECT 1
              FROM observation_environment_qualitative oscqe
              JOIN survey_observation so ON oscqe.survey_observation_id = so.survey_observation_id
              WHERE so.survey_id = ${surveyId}
              AND eq.environment_qualitative_id = oscqe.environment_qualitative_id
          )
          UNION
          SELECT 
              eqt.name AS header_name,
              'quantitative' AS source
          FROM environment_quantitative eqt
          WHERE EXISTS (
              SELECT 1
              FROM observation_environment_quantitative oscq
              JOIN survey_observation so ON oscq.survey_observation_id = so.survey_observation_id
              WHERE so.survey_id = ${surveyId}
              AND eqt.environment_quantitative_id = oscq.environment_quantitative_id
          )
      ),
      unique_meas_headers AS (
          SELECT 
              oscqm.critterbase_taxon_measurement_id::TEXT AS header_name,
              'qualitative' AS source
          FROM observation_subcount_qualitative_measurement oscqm
          WHERE EXISTS (
              SELECT 1
              FROM observation_subcount osc
              JOIN survey_observation so ON osc.survey_observation_id = so.survey_observation_id
              WHERE so.survey_id = ${surveyId}
              AND osc.observation_subcount_id = oscqm.observation_subcount_id
          )
          UNION
          SELECT 
              oscqmm.critterbase_taxon_measurement_id::TEXT AS header_name,
              'quantitative' AS source
          FROM observation_subcount_quantitative_measurement oscqmm
          WHERE EXISTS (
              SELECT 1
              FROM observation_subcount osc
              JOIN survey_observation so ON osc.survey_observation_id = so.survey_observation_id
              WHERE so.survey_id = ${surveyId}
              AND osc.observation_subcount_id = oscqmm.observation_subcount_id
          )
      ),
      combined_env_data AS (
          SELECT
              ad.observation_id,
              ad.subcount_id,
              ad.tsn,
              ad.species,
              ad.site,
              ad.technique,
              ad.start_date,
              ad.end_date,
              ad.sign,
              ad.count,
              ad.observation_date,
              ad.observation_time,
              ad.latitude,
              ad.longitude,
              ad.comment,
              jsonb_agg(
                  jsonb_build_object(
                      'eh', eh.header_name,
                      'ev', COALESCE(
                          eqd.eh_value,
                          eqd2.eh_value
                      )
                  )
                  ORDER BY eh.header_name
              ) AS env_data
          FROM aggregated_data ad
          LEFT JOIN unique_env_headers eh ON eh.header_name IS NOT NULL
          LEFT JOIN LATERAL (
              SELECT e2->>'ev' AS eh_value
              FROM jsonb_array_elements(ad.env_qual_data) AS e2
              WHERE e2->>'eh' = eh.header_name
              LIMIT 1
          ) eqd ON true
          LEFT JOIN LATERAL (
              SELECT e2->>'ev' AS eh_value
              FROM jsonb_array_elements(ad.env_quan_data) AS e2
              WHERE e2->>'eh' = eh.header_name
              LIMIT 1
          ) eqd2 ON true
          GROUP BY ad.observation_id, ad.subcount_id, ad.tsn, ad.species, ad.site, ad.technique, ad.start_date, ad.end_date, ad.sign, ad.count, ad.observation_date, ad.observation_time, ad.latitude, ad.longitude, ad.comment
      ),
      combined_meas_data AS (
          SELECT 
              ad.observation_id,
              ad.subcount_id,
              ad.tsn,
              ad.species,
              ad.site,
              ad.technique,
              ad.start_date,
              ad.end_date,
              ad.sign,
              ad.count,
              ad.observation_date,
              ad.observation_time,
              ad.latitude,
              ad.longitude,
              ad.comment,
              jsonb_agg(
                  jsonb_build_object(
                      'mh', mh.header_name,
                      'mv', COALESCE(
                          mqd.mh_value,
                          mqd2.mh_value
                      )
                  )
                  ORDER BY mh.header_name
              ) AS meas_data
          FROM aggregated_data ad
          LEFT JOIN unique_meas_headers mh ON mh.header_name IS NOT NULL
          LEFT JOIN LATERAL (
              SELECT e2->>'mv' AS mh_value
              FROM jsonb_array_elements(ad.meas_qual_data) AS e2
              WHERE e2->>'mh' = mh.header_name
              LIMIT 1
          ) mqd ON true
          LEFT JOIN LATERAL (
              SELECT e2->>'mv' AS mh_value
              FROM jsonb_array_elements(ad.meas_quan_data) AS e2
              WHERE e2->>'mh' = mh.header_name
              LIMIT 1
          ) mqd2 ON true
          GROUP BY ad.observation_id, ad.subcount_id, ad.tsn, ad.species, ad.site, ad.technique, ad.start_date, ad.end_date, ad.sign, ad.count, ad.observation_date, ad.observation_time, ad.latitude, ad.longitude, ad.comment
      )
      SELECT 
          ce.observation_id,
          ce.subcount_id,
          ce.tsn,
          ce.species,
          ce.site,
          ce.technique,
          ce.start_date,
          ce.end_date,
          ce.sign,
          ce.count,
          ce.observation_date,
          ce.observation_time,
          ce.latitude,
          ce.longitude,
          ce.comment,
          ce.env_data,
          cm.meas_data
      FROM combined_env_data ce
      JOIN combined_meas_data cm ON ce.observation_id = cm.observation_id AND ce.subcount_id = cm.subcount_id
      ORDER BY ce.observation_id;
    `;
  }
}
