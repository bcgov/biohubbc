import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

/**
 * Insert object for a single sample period record.
 */
export type InsertSamplePeriodRecord = Pick<
  SamplePeriodRecord,
  'survey_sample_method_id' | 'start_date' | 'end_date' | 'start_time' | 'end_time'
>;

/**
 * Update object for a single sample period record.
 */
export type UpdateSamplePeriodRecord = Pick<
  SamplePeriodRecord,
  'survey_sample_period_id' | 'survey_sample_method_id' | 'start_date' | 'end_date' | 'start_time' | 'end_time'
>;

/**
 * A survey_sample_period record.
 */
export const SamplePeriodRecord = z.object({
  survey_sample_period_id: z.number(),
  survey_sample_method_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  start_time: z.string().nullable(),
  end_time: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SamplePeriodRecord = z.infer<typeof SamplePeriodRecord>;

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
   * @param {number} surveyId
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SamplePeriodRecord[]>}
   * @memberof SamplePeriodRepository
   */
  async getSamplePeriodsForSurveyMethodId(surveyId: number, surveySampleMethodId: number): Promise<SamplePeriodRecord[]> {
    const sql = SQL`
      SELECT
        *
      FROM
        survey_sample_period
      WHERE
        survey_sample_method_id
      IN (
        SELECT
          survey_sample_method_id
        FROM
          survey_sample_method
        WHERE
          survey_sample_method_id = ${surveySampleMethodId}
        AND
          survey_sample_site_id
        IN (
          SELECT
            survey_sample_site_id
          FROM
            survey_sample_siet
          WHERE
            survey_id = ${surveyId}
        )
      );
    `;

    const response = await this.connection.sql(sql, SamplePeriodRecord);
    return response.rows;
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {UpdateSamplePeriodRecord} sample
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodRepository
   */
  async updateSamplePeriod(sample: UpdateSamplePeriodRecord): Promise<SamplePeriodRecord> {
    const sql = SQL`
      UPDATE survey_sample_period
      SET
        survey_sample_method_id=${sample.survey_sample_method_id},
        start_date=${sample.start_date},
        end_date=${sample.end_date},
        start_time=${sample.start_time || null},
        end_time=${sample.end_time || null}
        WHERE
        survey_sample_period_id = ${sample.survey_sample_period_id}
      RETURNING
        *;`;

    const response = await this.connection.sql(sql, SamplePeriodRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample period', [
        'SamplePeriodRepository->updateSamplePeriod',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample Period.
   *
   * @param {InsertSamplePeriodRecord} sample
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodRepository
   */
  async insertSamplePeriod(sample: InsertSamplePeriodRecord): Promise<SamplePeriodRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_period (
      survey_sample_method_id,
      start_date,
      end_date,
      start_time,
      end_time
    ) VALUES (
      ${sample.survey_sample_method_id},
      ${sample.start_date},
      ${sample.end_date},
      ${sample.start_time || null},
      ${sample.end_time || null}
      )
      RETURNING
        *;`;

    const response = await this.connection.sql(sqlStatement, SamplePeriodRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample period', [
        'SamplePeriodRepository->insertSamplePeriod',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes a survey Sample Period.
   *
   * @param {number} surveySamplePeriodId
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodRepository
   */
  async deleteSamplePeriodRecord(surveySamplePeriodId: number): Promise<SamplePeriodRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_period
      WHERE
        survey_sample_period_id = ${surveySamplePeriodId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SamplePeriodRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample period', [
        'SamplePeriodRepository->deleteSamplePeriodRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes multiple Survey Sample Periods for a given array of period ids.
   *
   * @param {number[]} periodsToDelete an array of period ids to delete
   * @returns {*} {Promise<SamplePeriodRecord[]>} an array of promises for the deleted periods
   * @memberof SamplePeriodRepository
   */
  async deleteSamplePeriods(periodsToDelete: number[]): Promise<SamplePeriodRecord[]> {
    const knex = getKnex();

    const sqlStatement = knex
      .queryBuilder()
      .delete()
      .from('survey_sample_period')
      .whereIn('survey_sample_period_id', periodsToDelete)
      .returning('*');

    const response = await this.connection.knex(sqlStatement, SamplePeriodRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample periods', [
        'SamplePeriodRepository->deleteSamplePeriods',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }
}
