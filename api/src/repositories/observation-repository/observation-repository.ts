import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { SurveyObservationModel, SurveyObservationRecord } from '../../database-models/survey_observation';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { IObservationAdvancedFilters } from '../../models/observation-view';
import { getLogger } from '../../utils/logger';
import { GeoJSONPointZodSchema } from '../../zod-schema/geoJsonZodSchema';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import {
  ObservationSubCountQualitativeEnvironmentRecord,
  ObservationSubCountQuantitativeEnvironmentRecord
} from '../observation-subcount-environment-repository';
import {
  ObservationSubCountQualitativeMeasurementRecord,
  ObservationSubCountQuantitativeMeasurementRecord
} from '../observation-subcount-measurement-repository';
import { ObservationSubCountRecord } from '../subcount-repository';
import { getSurveyObservationsBaseQuery, makeFindObservationsQuery } from './utils';

const defaultLog = getLogger('repositories/observation-repository');

export const ObservationSpecies = z.object({
  itis_tsn: z.number()
});

export type ObservationSpecies = z.infer<typeof ObservationSpecies>;

const ObservationSamplingData = z.object({
  survey_sample_site_id: z.number().nullable(),
  survey_sample_site_name: z.string().nullable(),
  method_technique_id: z.number().nullable(),
  method_technique_name: z.string().nullable(),
  // survey_sample_period_id is already included in the SurveyObservationRecord
  survey_sample_period_start_datetime: z.string().nullable()
});

const ObservationSubcountQualitativeMeasurementObject = ObservationSubCountQualitativeMeasurementRecord.pick({
  critterbase_taxon_measurement_id: true,
  critterbase_measurement_qualitative_option_id: true
});

const ObservationSubcountQuantitativeMeasurementObject = ObservationSubCountQuantitativeMeasurementRecord.pick({
  critterbase_taxon_measurement_id: true,
  value: true
});

const ObservationSubcountQualitativeEnvironmentObject = ObservationSubCountQualitativeEnvironmentRecord.pick({
  observation_subcount_qualitative_environment_id: true,
  environment_qualitative_id: true,
  environment_qualitative_option_id: true
});

const ObservationSubcountQuantitativeEnvironmentObject = ObservationSubCountQuantitativeEnvironmentRecord.pick({
  observation_subcount_quantitative_environment_id: true,
  environment_quantitative_id: true,
  value: true
});

const ObservationSubcountObject = z.object({
  observation_subcount_id: ObservationSubCountRecord.shape.observation_subcount_id,
  observation_subcount_sign_id: ObservationSubCountRecord.shape.observation_subcount_sign_id,
  comment: ObservationSubCountRecord.shape.comment,
  subcount: ObservationSubCountRecord.shape.subcount,
  qualitative_measurements: z.array(ObservationSubcountQualitativeMeasurementObject),
  quantitative_measurements: z.array(ObservationSubcountQuantitativeMeasurementObject),
  qualitative_environments: z.array(ObservationSubcountQualitativeEnvironmentObject),
  quantitative_environments: z.array(ObservationSubcountQuantitativeEnvironmentObject)
});

const ObservationSubcountsObject = z.object({
  subcounts: z.array(ObservationSubcountObject)
});

/**
 * An extended observation record.
 * Includes:
 * - fields from the observation record
 * - additional fields about the survey_sample_* data for the observation record
 * - additional fields about the subcount records for the observation record
 */
export const ObservationRecordWithSamplingAndSubcountData = SurveyObservationRecord.extend(
  ObservationSamplingData.shape
).extend(ObservationSubcountsObject.shape);
export type ObservationRecordWithSamplingAndSubcountData = z.infer<typeof ObservationRecordWithSamplingAndSubcountData>;

export const ObservationGeometryRecord = z.object({
  survey_observation_id: z.number(),
  geometry: GeoJSONPointZodSchema
});
export type ObservationGeometryRecord = z.infer<typeof ObservationGeometryRecord>;

/**
 * Interface reflecting survey observations that are being inserted into the database
 */
export type InsertObservation = Pick<
  SurveyObservationRecord,
  | 'itis_tsn'
  | 'itis_scientific_name'
  | 'survey_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_period_id'
>;

/**
 * Interface reflecting survey observations that are being updated in the database
 */
export type UpdateObservation = Pick<
  SurveyObservationRecord,
  | 'itis_tsn'
  | 'itis_scientific_name'
  | 'survey_observation_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_period_id'
>;

/**
 * Interface reflecting survey observations retrieved from the database
 */
export const ObservationSubmissionRecord = z.object({
  submission_id: z.number(),
  survey_id: z.number(),
  key: z.string(),
  original_filename: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable()
});

export type ObservationSubmissionRecord = z.infer<typeof ObservationSubmissionRecord>;

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

  /**
   * Retrieves a paginated set of observation records for the given survey, including data for
   * associated sampling records.
   *
   * @param {number} surveyId The ID of the survey.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<ObservationRecordWithSamplingAndSubcountData[]>} A promise resolving to the list of observations.
   * @memberof ObservationRepository
   */
  async getSurveyObservationsWithSamplingDataWithAttributesData(
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

    const response = await this.connection.knex(query);

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
   * Performs an upsert for all observation records belonging to the given survey, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((InsertObservation | UpdateObservation)[])} observations
   * @return {*}  {Promise<SurveyObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<SurveyObservationRecord[]> {
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation
      (
        survey_observation_id,
        survey_id,
        survey_sample_period_id,
        count,
        latitude,
        longitude,
        observation_date,
        observation_time,
        itis_tsn,
        itis_scientific_name
      )
      OVERRIDING SYSTEM VALUE
      VALUES
    `;

    sqlStatement.append(
      observations
        .map((observation) => {
          return `(${[
            'survey_observation_id' in observation && observation.survey_observation_id
              ? observation.survey_observation_id
              : 'DEFAULT',
            surveyId,
            observation.survey_sample_period_id ?? 'NULL',
            observation.count,
            observation.latitude ?? 'NULL',
            observation.longitude ?? 'NULL',
            observation.observation_date ? `'${observation.observation_date}'` : 'NULL',
            observation.observation_time ? `'${observation.observation_time}'` : 'NULL',
            observation.itis_tsn ?? 'NULL',
            observation.itis_scientific_name ? `'${observation.itis_scientific_name}'` : 'NULL'
          ].join(', ')})`;
        })
        .join(', ')
    );

    sqlStatement.append(`
      ON CONFLICT
        (survey_observation_id)
      DO UPDATE SET
        itis_tsn = EXCLUDED.itis_tsn,
        itis_scientific_name = EXCLUDED.itis_scientific_name,
        survey_sample_period_id = EXCLUDED.survey_sample_period_id,
        count = EXCLUDED.count,
        observation_date = EXCLUDED.observation_date,
        observation_time = EXCLUDED.observation_time,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude
    `);

    sqlStatement.append(`
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
        observation_date;
    `);

    const response = await this.connection.sql(sqlStatement, SurveyObservationRecord);

    return response.rows;
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
   * @return {*}  {Promise<SurveyObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyId: number, surveyObservationId: number): Promise<SurveyObservationRecord> {
    const knex = getKnex();
    const query = knex
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
        'observation_date'
      ])
      .from('survey_observation')
      .where('survey_observation_id', surveyObservationId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query, SurveyObservationRecord);

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
        'observation_date'
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
  async getSurveyObservationCount(surveyId: number): Promise<number> {
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
      throw new ApiExecuteSQLError('Failed to get survey count', [
        'findObservationsCount->findObservationsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Inserts a survey observation submission record into the database and returns the record
   *
   * @param {number} submission_id
   * @param {string} key
   * @param {number} survey_id
   * @param {string} original_filename
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationRepository
   */
  async insertSurveyObservationSubmission(
    submission_id: number,
    key: string,
    survey_id: number,
    original_filename: string
  ): Promise<ObservationSubmissionRecord> {
    defaultLog.debug({ label: 'insertSurveyObservationSubmission' });
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation_submission
        (submission_id, key, survey_id, original_filename)
      VALUES
        (${submission_id}, ${key}, ${survey_id}, ${original_filename})
      RETURNING *;`;

    const response = await this.connection.sql(sqlStatement, ObservationSubmissionRecord);

    return response.rows[0];
  }

  /**
   * Retrieves the next submission ID from the survey_observation_submission_seq sequence
   *
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getNextSubmissionId(): Promise<number> {
    const sqlStatement = SQL`
      SELECT nextval('biohub.survey_observation_submission_id_seq')::integer as submission_id;
    `;
    const response = await this.connection.sql<{ submission_id: number }>(sqlStatement);
    return response.rows[0].submission_id;
  }

  /**
   * Retrieves the observation submission record by the given submission ID.
   *
   * @param {number} surveyId
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationRepository
   */
  async getObservationSubmissionById(surveyId: number, submissionId: number): Promise<ObservationSubmissionRecord> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .select('*')
      .from('survey_observation_submission')
      .where('submission_id', submissionId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, ObservationSubmissionRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get observation submission', [
        'ObservationRepository->getObservationSubmissionById',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
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

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete observation records', [
        'ObservationRepository->deleteObservationsByIds',
        'rowCount was null or undefined, expected rowCount = 1'
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
   * Build the export observation records query
   *
   * @static
   * @param {Knex} knex
   * @param {number} surveyId
   * @returns {Knex.QueryBuilder}
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
          LEFT JOIN observation_subcount_sign os_sign ON osc.observation_subcount_sign_id = os_sign.observation_subcount_sign_id
          LEFT JOIN observation_subcount_qualitative_environment oscqe ON osc.observation_subcount_id = oscqe.observation_subcount_id
          LEFT JOIN observation_subcount_quantitative_environment oscq ON osc.observation_subcount_id = oscq.observation_subcount_id
          LEFT JOIN environment_qualitative eq ON oscqe.environment_qualitative_id = eq.environment_qualitative_id
          LEFT JOIN environment_qualitative_option eqo ON oscqe.environment_qualitative_option_id = eqo.environment_qualitative_option_id
          LEFT JOIN environment_quantitative eqt ON oscq.environment_quantitative_id = eqt.environment_quantitative_id
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
          SELECT DISTINCT
              eq.name AS header_name,
              'qualitative' AS source
          FROM environment_qualitative eq
          JOIN observation_subcount_qualitative_environment oscqe ON eq.environment_qualitative_id = oscqe.environment_qualitative_id
          UNION
          SELECT DISTINCT
              eqt.name AS header_name,
              'quantitative' AS source
          FROM environment_quantitative eqt
          JOIN observation_subcount_quantitative_environment oscq ON eqt.environment_quantitative_id = oscq.environment_quantitative_id
      ),
      unique_meas_headers AS (
          SELECT DISTINCT
              oscqm.critterbase_taxon_measurement_id::TEXT AS header_name,
              'qualitative' AS source
          FROM observation_subcount_qualitative_measurement oscqm
          UNION
          SELECT DISTINCT
              oscqmm.critterbase_taxon_measurement_id::TEXT AS header_name,
              'quantitative' AS source
          FROM observation_subcount_quantitative_measurement oscqmm
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
                      'eh', e.header_name,
                      'ev', COALESCE(
                          (SELECT e2->>'ev' FROM jsonb_array_elements(ad.env_qual_data) AS e2 WHERE e2->>'eh' = e.header_name LIMIT 1),
                          (SELECT e2->>'ev' FROM jsonb_array_elements(ad.env_quan_data) AS e2 WHERE e2->>'eh' = e.header_name LIMIT 1)
                      )
                  )
              ) AS env_data
          FROM aggregated_data ad
          LEFT JOIN unique_env_headers e ON e.header_name IS NOT NULL
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
                      'mh', m.header_name,
                      'mv', COALESCE(
                          (SELECT e2->>'mv' FROM jsonb_array_elements(ad.meas_qual_data) AS e2 WHERE e2->>'mh' = m.header_name LIMIT 1),
                          (SELECT e2->>'mv' FROM jsonb_array_elements(ad.meas_quan_data) AS e2 WHERE e2->>'mh' = m.header_name LIMIT 1)
                      )
                  )
              ) AS meas_data
          FROM aggregated_data ad
          LEFT JOIN unique_meas_headers m ON m.header_name IS NOT NULL
          GROUP BY ad.observation_id, ad.subcount_id, ad.tsn, ad.species, ad.site, ad.technique, ad.start_date, ad.end_date, ad.sign, ad.count, ad.observation_date, ad.observation_time, ad.latitude, ad.longitude, ad.comment
      )
      SELECT 
          e.observation_id,
          e.subcount_id,
          e.tsn,
          e.species,
          e.site,
          e.technique,
          e.start_date,
          e.end_date,
          e.sign,
          e.count,
          e.observation_date,
          e.observation_time,
          e.latitude,
          e.longitude,
          e.comment,
          e.env_data,
          m.meas_data
      FROM combined_env_data e
      JOIN combined_meas_data m ON e.observation_id = m.observation_id AND e.subcount_id = m.subcount_id
      ORDER BY e.observation_id;
    `;
  }
}
