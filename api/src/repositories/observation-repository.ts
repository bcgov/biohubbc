import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * Interface reflecting survey observations retrieved from the database
 */
export const ObservationRecord = z.object({
  survey_observation_id: z.number(),
  survey_id: z.number(),
  wldtaxonomic_units_id: z.number(),
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

/**
 * Interface reflecting survey observations that are being inserted into the database
 */
export type InsertObservation = Pick<
  ObservationRecord,
  | 'survey_id'
  | 'wldtaxonomic_units_id'
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
  | 'survey_observation_id'
  | 'wldtaxonomic_units_id'
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

const defaultLog = getLogger('repositories/observation-repository');

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
    if (!observations.length) {
      // no observations to create or update, leave early
      return [];
    }
    const sqlStatement = SQL`
      INSERT INTO
        survey_observation
      (
        survey_observation_id,
        survey_id,
        wldtaxonomic_units_id,
        survey_sample_site_id,
        survey_sample_method_id,
        survey_sample_period_id,
        count,
        latitude,
        longitude,
        observation_date,
        observation_time
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
            observation.wldtaxonomic_units_id,
            observation.survey_sample_site_id ?? 'NULL',
            observation.survey_sample_method_id ?? 'NULL',
            observation.survey_sample_period_id ?? 'NULL',
            observation.count,
            observation.latitude,
            observation.longitude,
            `'${observation.observation_date}'`,
            `'${observation.observation_time}'`
          ].join(', ')})`;
        })
        .join(', ')
    );

    sqlStatement.append(`
      ON CONFLICT
        (survey_observation_id)
      DO UPDATE SET
        wldtaxonomic_units_id = EXCLUDED.wldtaxonomic_units_id,
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
      RETURNING*;
    `);
    const response = await this.connection.sql(sqlStatement, ObservationRecord);

    return response.rows;
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationRepository
   */
  async getSurveyObservations(surveyId: number, pagination?: ApiPaginationOptions): Promise<ObservationRecord[]> {
    const knex = getKnex();
    const allRowsQuery = knex.queryBuilder().select('*').from('survey_observation').where('survey_id', surveyId);

    const query = pagination
      ? allRowsQuery.limit(pagination.limit).offset(pagination.page * pagination.limit)
      : allRowsQuery;

    // TODO possible to conditionally chain these methods together, rather than redeclare the query builder?
    const query2 = pagination?.sort && pagination.order ? query.orderBy(pagination.sort, pagination.order) : query;

    const response = await this.connection.knex(query2, ObservationRecord);
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
   * Deletes all of the given survey observations by ID.
   *
   * @param {number[]} observationIds
   * @return {*}  {Promise<number>}
   * @memberof ObservationRepository
   */
  async deleteObservationsByIds(observationIds: number[]): Promise<number> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .delete()
      .from('survey_observation')
      .whereIn('survey_observation_id', observationIds)
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
