import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import { InsertSamplePeriodRecord, UpdateSamplePeriodRecord } from './sample-period-repository';

/**
 * Insert object for a single sample method record.
 */
export type InsertSampleMethodRecord = Pick<
  SampleMethodRecord,
  'survey_sample_site_id' | 'method_lookup_id' | 'description' | 'method_response_metric_id'
> & { periods: InsertSamplePeriodRecord[] };

/**
 * Update object for a single sample method record.
 */
export type UpdateSampleMethodRecord = Pick<
  SampleMethodRecord,
  'survey_sample_method_id' | 'survey_sample_site_id' | 'method_lookup_id' | 'description' | 'method_response_metric_id'
> & { periods: UpdateSamplePeriodRecord[] };

/**
 * A survey_sample_method record.
 */
export const SampleMethodRecord = z.object({
  survey_sample_method_id: z.number(),
  survey_sample_site_id: z.number(),
  method_lookup_id: z.number(),
  method_response_metric_id: z.number(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleMethodRecord = z.infer<typeof SampleMethodRecord>;

/**
 * Sample Method Repository
 *
 * @export
 * @class SampleMethodRepository
 * @extends {BaseRepository}
 */
export class SampleMethodRepository extends BaseRepository {
  /**
   * Gets all survey Sample Methods.
   *
   * @param {number} surveyId
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleMethodRecord[]>}
   * @memberof SampleMethodRepository
   */
  async getSampleMethodsForSurveySampleSiteId(
    surveyId: number,
    surveySampleSiteId: number
  ): Promise<SampleMethodRecord[]> {
    const sql = SQL`
      SELECT
        *
      FROM
        survey_sample_method
      WHERE
        survey_sample_site_id = (
          SELECT
            survey_sample_site_id
          FROM
            survey_sample_site
          WHERE
            survey_sample_site_id = ${surveySampleSiteId}
          AND
            survey_id = ${surveyId}
          LIMIT 1
        )
      ;
    `;

    const response = await this.connection.sql(sql, SampleMethodRecord);
    return response.rows;
  }

  /**
   * updates a survey Sample method.
   *
   * @param {UpdateSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async updateSampleMethod(surveyId: number, sampleMethod: UpdateSampleMethodRecord): Promise<SampleMethodRecord> {
    const sql = SQL`
      UPDATE survey_sample_method ssm
      SET
          survey_sample_site_id = ${sampleMethod.survey_sample_site_id},
          method_lookup_id = ${sampleMethod.method_lookup_id},
          description = ${sampleMethod.description},
          method_response_metric_id = ${sampleMethod.method_response_metric_id}
      FROM 
          survey_sample_site sss
      WHERE
          ssm.survey_sample_site_id = sss.survey_sample_site_id
          AND ssm.survey_sample_method_id = ${sampleMethod.survey_sample_method_id}
          AND sss.survey_id = ${surveyId}
      RETURNING ssm.*;
    `;

    const response = await this.connection.sql(sql);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample method', [
        'SampleMethodRepository->updateSampleMethod',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample method.
   *
   * @param {InsertSampleMethodRecord} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async insertSampleMethod(sampleMethod: InsertSampleMethodRecord): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
      INSERT INTO survey_sample_method (
        survey_sample_site_id,
        method_lookup_id,
        description,
        method_response_metric_id
      ) VALUES (
        ${sampleMethod.survey_sample_site_id},
        ${sampleMethod.method_lookup_id},
        ${sampleMethod.description},
        ${sampleMethod.method_response_metric_id}
        )
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SampleMethodRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample method', [
        'SampleMethodRepository->insertSampleMethod',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes a survey Sample method.
   *
   * @param {number} surveyId
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async deleteSampleMethodRecord(surveyId: number, surveySampleMethodId: number): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
      DELETE FROM survey_sample_method
      USING survey_sample_site sss
      WHERE
          survey_sample_method.survey_sample_site_id = sss.survey_sample_site_id
          AND survey_sample_method_id = ${surveySampleMethodId}
          AND survey_id = ${surveyId}
      RETURNING *;
    `;

    const response = await this.connection.sql(sqlStatement, SampleMethodRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample method', [
        'SampleMethodRepository->deleteSampleMethodRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
