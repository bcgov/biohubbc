import SQL from 'sql-template-strings';
import { z } from 'zod';
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

/**
 * Interface reflecting survey observations retrieved from the database
 */
export const ObservationRecord = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  itis_tsn: z.number(),
  itis_scientific_name: z.string().nullable(),
  survey_sample_site_id: z.number().nullable(),
  survey_sample_method_id: z.number().nullable(),
  survey_sample_period_id: z.number().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  count: z.number(),
  observation_time: z.string(),
  observation_date: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationRecord = z.infer<typeof ObservationRecord>;

const ObservationSamplingData = z.object({
  survey_sample_site_name: z.string().nullable(),
  survey_sample_method_name: z.string().nullable(),
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
export const ObservationRecordWithSamplingAndSubcountData = ObservationRecord.pick({
  survey_observation_id: true,
  survey_id: true,
  itis_tsn: true,
  itis_scientific_name: true,
  survey_sample_site_id: true,
  survey_sample_method_id: true,
  survey_sample_period_id: true,
  latitude: true,
  longitude: true,
  count: true,
  observation_time: true,
  observation_date: true
})
  .extend(ObservationSamplingData.shape)
  .extend(ObservationSubcountsObject.shape);
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
  ObservationRecord,
  | 'itis_tsn'
  | 'itis_scientific_name'
  | 'survey_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_site_id'
  | 'survey_sample_method_id'
  | 'survey_sample_period_id'
>;

/**
 * Interface reflecting survey observations that are being updated in the database
 */
export type UpdateObservation = Pick<
  ObservationRecord,
  | 'itis_tsn'
  | 'itis_scientific_name'
  | 'survey_observation_id'
  | 'latitude'
  | 'longitude'
  | 'count'
  | 'observation_date'
  | 'observation_time'
  | 'survey_sample_site_id'
  | 'survey_sample_method_id'
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
    filterFields: IObservationAdvancedFilters,
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
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation
      (
        survey_observation_id,
        survey_id,
        survey_sample_site_id,
        survey_sample_method_id,
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
            observation.survey_sample_site_id ?? 'NULL',
            observation.survey_sample_method_id ?? 'NULL',
            observation.survey_sample_period_id ?? 'NULL',
            observation.count,
            observation.latitude,
            observation.longitude,
            `'${observation.observation_date}'`,
            `'${observation.observation_time}'`,
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
        survey_sample_site_id = EXCLUDED.survey_sample_site_id,
        survey_sample_method_id = EXCLUDED.survey_sample_method_id,
        survey_sample_period_id = EXCLUDED.survey_sample_period_id,
        count = EXCLUDED.count,
        observation_date = EXCLUDED.observation_date,
        observation_time = EXCLUDED.observation_time,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude
    `);

    sqlStatement.append(`
      RETURNING *;
    `);

    const response = await this.connection.sql(sqlStatement, ObservationRecord);

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
      .where('survey_id', surveyId);

    const response = await this.connection.knex(query, ObservationGeometryRecord);

    return response.rows;
  }

  /**
   * Retrieves a single observation record
   *
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyId: number, surveyObservationId: number): Promise<ObservationRecord> {
    const knex = getKnex();
    const query = knex
      .queryBuilder()
      .select('*')
      .from('survey_observation')
      .where('survey_observation_id', surveyObservationId)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(query, ObservationRecord);

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
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getAllSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    const knex = getKnex();
    const allRowsQuery = knex.queryBuilder().select('*').from('survey_observation').where('survey_id', surveyId);

    const response = await this.connection.knex(allRowsQuery, ObservationRecord);
    return response.rows;
  }

  /**
   * Retrieves the count of survey observations for the given survey
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
   * Retrieves the count of survey observations for the given survey
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
    const observationListQuery = makeFindObservationsQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    const queryBuilder = knex.from(observationListQuery.as('olq')).select(knex.raw('count(*)::integer as count'));

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

    const response = await this.connection.knex(queryBuilder, ObservationRecord);

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
      .where('survey_id', surveyId)
      .whereIn('survey_sample_site_id', sampleSiteIds);

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
   * Retrieves observation records count for the given survey and sample method ids
   *
   * @param {number[]} sampleMethodIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySampleMethodIds(sampleMethodIds: number[]): Promise<number> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('COUNT(survey_observation_id)::integer as count'))
      .from('survey_observation')
      .whereIn('survey_sample_method_id', sampleMethodIds);

    const response = await this.connection.knex(sqlStatement, z.object({ count: z.number() }));

    if (response?.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get observations count', [
        'ObservationRepository->getObservationsCountBySampleMethodId',
        'response.rowCount was !== 1, expected rowCount === 1'
      ]);
    }

    return response.rows[0].count;
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
}
