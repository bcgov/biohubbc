import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { CBMeasurementValue } from '../services/critterbase-service';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

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

const ObservationSamplingData = ObservationRecord.extend({
  survey_sample_site_name: z.string().nullable(),
  survey_sample_method_name: z.string().nullable(),
  survey_sample_period_start_datetime: z.string().nullable()
});

// type ObservationSamplingData = z.infer<typeof ObservationSamplingData>;

export const ObservationRecordWithSamplingDataWithSubcount = ObservationRecord.extend(
  ObservationSamplingData.shape
).extend({
  subcount: z.number().nullable(),
  observation_subcount_attributes: z.array(CBMeasurementValue)
});

export type ObservationRecordWithSamplingDataWithSubcount = z.infer<
  typeof ObservationRecordWithSamplingDataWithSubcount
>;

export const ObservationSubcountRecord = z.object({
  observation_subcount_id: z.number(),
  survey_observation_id: z.number(),
  subcount: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type ObservationSubcountRecord = z.infer<typeof ObservationSubcountRecord>;

export const ObservationGeometryRecord = z.object({
  survey_observation_id: z.number(),
  geometry: z.string().transform((jsonString) => JSON.parse(jsonString))
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

    return response.rowCount;
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
            observation['survey_observation_id'] || 'DEFAULT',
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
   * Retrieves a paginated set of observation records for the given survey, including data for
   * associated sampling records.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ObservationRecordWithSamplingDataWithSubcount[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationsWithSamplingDataWithAttributesData(
    surveyId: number,
    pagination?: ApiPaginationOptions
  ): Promise<ObservationRecordWithSamplingDataWithSubcount[]> {
    defaultLog.debug({ label: 'getSurveyObservationsWithSamplingDataWithAttributesData', surveyId, pagination });

    const knex = getKnex();

    const queryBuilder = knex
      .with(
        'w_qualitative_measurements',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'critterbase_measurement_qualitative_id', critterbase_measurement_qualitative_id,
                'critterbase_measurement_qualitative_option_id', critterbase_measurement_qualitative_option_id
              )) as qualitative_measurements
            `)
          )
          .from('observation_subcount_qualitative_measurement')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').where('survey_id', surveyId);
              });
          })
          .groupBy('observation_subcount_id')
      )
      .with(
        'w_quantitative_measurements',
        knex
          .select(
            'observation_subcount_id',
            knex.raw(`
              json_agg(json_build_object(
                'critterbase_measurement_quantitative_id', critterbase_measurement_quantitative_id,
                'value', value
              )) as quantitative_measurements
            `)
          )
          .from('observation_subcount_quantitative_measurement')
          .whereIn('observation_subcount_id', (qb1) => {
            qb1
              .select('observation_subcount_id')
              .from('observation_subcount')
              .whereIn('survey_observation_id', (qb2) => {
                qb2.select('survey_observation_id').from('survey_observation').where('survey_id', surveyId);
              });
          })
          .groupBy('observation_subcount_id')
      )
      .with(
        'w_subcounts',
        knex
          .select(
            'survey_observation_id',
            knex.raw(`
              json_agg(json_build_object(
                'observation_subcount_id', observation_subcount.observation_subcount_id,
                'subcount', subcount,
                'qualitative_measurements', COALESCE(w_qualitative_measurements.qualitative_measurements, '[]'::json),
                'quantitative_measurements', COALESCE(w_quantitative_measurements.quantitative_measurements, '[]'::json)
              )) as subcounts
            `)
          )
          .from('observation_subcount')
          .leftJoin(
            'w_qualitative_measurements',
            'observation_subcount.observation_subcount_id',
            'w_qualitative_measurements.observation_subcount_id'
          )
          .leftJoin(
            'w_quantitative_measurements',
            'observation_subcount.observation_subcount_id',
            'w_quantitative_measurements.observation_subcount_id'
          )
          .whereIn(
            'survey_observation_id',
            knex('survey_observation').select('survey_observation_id').where('survey_id', 1)
          )
          .groupBy('survey_observation_id')
      )
      .select('survey_observation.*', knex.raw(`COALESCE(w_subcounts.subcounts, '[]'::json) as subcounts`))
      .from('survey_observation')
      .innerJoin('w_subcounts', 'w_subcounts.survey_observation_id', 'survey_observation.survey_observation_id')
      .where('survey_observation.survey_id', surveyId);

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, ObservationRecordWithSamplingDataWithSubcount);

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
      .select('survey_observation_id', knex.raw('ST_AsGeoJSON(ST_MakePoint(longitude, latitude)) as geometry'))
      .from('survey_observation')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(query, ObservationGeometryRecord);

    return response.rows;
  }

  /**
   * Retrieves a single observation record
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservationById(surveyObservationId: number): Promise<ObservationRecord> {
    const knex = getKnex();
    const query = knex
      .queryBuilder()
      .select('*')
      .from('survey_observation')
      .where('survey_observation_id', surveyObservationId);

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
      .count('survey_observation_id as rowCount')
      .from('survey_observation')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(sqlStatement);

    return Number(response.rows[0].rowCount);
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
   * @param {number} submissionId
   * @return {*}  {Promise<ObservationSubmissionRecord>}
   * @memberof ObservationService
   */
  async getObservationSubmissionById(submissionId: number): Promise<ObservationSubmissionRecord> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .select('*')
      .from('survey_observation_submission')
      .where('submission_id', submissionId);

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

    return response.rowCount;
  }

  /**
   * Retrieves observation records count for the given survey and sample site id
   *
   * @param {number} surveyId
   * @param {number} sampleSiteId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySampleSiteId(
    surveyId: number,
    sampleSiteId: number
  ): Promise<{ observationCount: number }> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .count('survey_observation_id as rowCount')
      .from('survey_observation')
      .where('survey_id', surveyId)
      .where('survey_sample_site_id', sampleSiteId);

    const response = await this.connection.knex(sqlStatement);
    const observationCount = Number(response.rows[0].rowCount);
    return { observationCount };
  }

  /**
   * Retrieves observation records count for the given survey and sample site ids
   *
   * @param {number} surveyId
   * @param {number[]} sampleSiteIds
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySampleSiteIds(
    surveyId: number,
    sampleSiteIds: number[]
  ): Promise<{ observationCount: number }> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .count('survey_observation_id as rowCount')
      .from('survey_observation')
      .where('survey_id', surveyId)
      .whereIn('survey_sample_site_id', sampleSiteIds);

    const response = await this.connection.knex(sqlStatement);
    const observationCount = Number(response.rows[0].rowCount);
    return { observationCount };
  }

  /**
   * Retrieves observation records count for the given survey and sample method ids
   *
   * @param {number} sampleMethodId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySampleMethodId(sampleMethodId: number): Promise<{ observationCount: number }> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .count('survey_observation_id as rowCount')
      .from('survey_observation')
      .where('survey_sample_method_id', sampleMethodId);

    const response = await this.connection.knex(sqlStatement);
    const observationCount = Number(response.rows[0].rowCount);
    return { observationCount };
  }

  /**
   * Retrieves observation records count for the given survey and sample period ids
   *
   * @param {number} samplePeriodId
   * @return {*}  {Promise<{ observationCount: number }>}
   * @memberof ObservationRepository
   */
  async getObservationsCountBySamplePeriodId(samplePeriodId: number): Promise<{ observationCount: number }> {
    const knex = getKnex();
    const sqlStatement = knex
      .queryBuilder()
      .count('survey_observation_id as rowCount')
      .from('survey_observation')
      .where('survey_sample_period_id', samplePeriodId);

    const response = await this.connection.knex(sqlStatement);
    const observationCount = Number(response.rows[0].rowCount);
    return { observationCount };
  }
}
