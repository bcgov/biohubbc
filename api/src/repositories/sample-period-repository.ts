import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface PostSamplePeriod {
  survey_sample_period_id: number | null;
  survey_sample_method_id: number | null;
  start_date: string;
  end_date: string;
}

// This describes a row in the database for Survey Sample Period
export const SamplePeriodRecord = z.object({
  survey_sample_period_id: z.number(),
  survey_sample_method_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SamplePeriodRecord = z.infer<typeof SamplePeriodRecord>;

/**
 * Sample Repository
 *
 * @export
 * @class SamplePeriodRepository
 * @extends {BaseRepository}
 */
export class SamplePeriodRepository extends BaseRepository {
  /**
   * Gets all survey Sample periods.
   *
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SamplePeriodRecord[]>}
   * @memberof SamplePeriodRepository
   */
  async getSamplePeriodsForSurveyMethodId(surveySampleMethodId: number): Promise<SamplePeriodRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_period
      WHERE survey_sample_method_id = ${surveySampleMethodId};
    `;

    const response = await this.connection.sql(sql, SamplePeriodRecord);
    return response.rows;
  }

  /**
   * updates a survey Sample Period.
   *
   * @param {PostSamplePeriod} sample
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodRepository
   */
  async updateSamplePeriod(sample: PostSamplePeriod): Promise<SamplePeriodRecord> {
    const sql = SQL`
      UPDATE survey_sample_period
      SET
        survey_sample_method_id=${sample.survey_sample_method_id},
        start_date=${sample.start_date},
        end_date=${sample.end_date}
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
   * @param {Omit<PostSamplePeriod, 'survey_sample_period_id'>} sample
   * @return {*}  {Promise<SamplePeriodRecord>}
   * @memberof SamplePeriodRepository
   */
  async insertSamplePeriod(sample: Omit<PostSamplePeriod, 'survey_sample_period_id'>): Promise<SamplePeriodRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_period (
      survey_sample_method_id,
      start_date,
      end_date
    ) VALUES (
      ${sample.survey_sample_method_id},
      ${sample.start_date},
      ${sample.end_date}
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
}
