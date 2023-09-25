import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import { PostSamplePeriod } from './sample-period-repository';

export interface PostSampleMethod {
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_lookup_id: number;
  description: string;
  periods: PostSamplePeriod[];
}

// This describes a row in the database for Survey Sample Method
export const SampleMethodRecord = z.object({
  survey_sample_method_id: z.number(),
  survey_sample_site_id: z.number(),
  method_lookup_id: z.number(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleMethodRecord = z.infer<typeof SampleMethodRecord>;

/**
 * Sample Repository
 *
 * @export
 * @class SampleMethodRepository
 * @extends {BaseRepository}
 */
export class SampleMethodRepository extends BaseRepository {
  /**
   * Gets all survey Sample Methods.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleMethodRecord[]>}
   * @memberof SampleMethodRepository
   */
  async getSampleMethodsForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleMethodRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_method
      WHERE survey_sample_site_id = ${surveySampleSiteId};
    `;

    const response = await this.connection.sql(sql, SampleMethodRecord);
    return response.rows;
  }

  /**
   * updates a survey Sample method.
   *
   * @param {PostSampleMethod} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async updateSampleMethod(sampleMethod: PostSampleMethod): Promise<SampleMethodRecord> {
    const sql = SQL`
      UPDATE survey_sample_method
      SET
        survey_sample_site_id=${sampleMethod.survey_sample_site_id},
        method_lookup_id = ${sampleMethod.method_lookup_id},
        description=${sampleMethod.description}
      WHERE
        survey_sample_method_id = ${sampleMethod.survey_sample_method_id}
      RETURNING
        *;`;

    const response = await this.connection.sql(sql, SampleMethodRecord);

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
   * @param {Omit<PostSampleMethod, 'survey_sample_method_id'>} sampleMethod
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async insertSampleMethod(
    sampleMethod: Omit<PostSampleMethod, 'survey_sample_method_id'>
  ): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_method (
      survey_sample_site_id,
      method_lookup_id,
      description
    ) VALUES (
      ${sampleMethod.survey_sample_site_id},
      ${sampleMethod.method_lookup_id},
      ${sampleMethod.description}
      )
      RETURNING
        *;`;

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
   * @param {number} surveySampleMethodId
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async deleteSampleMethodRecord(surveySampleMethodId: number): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_method
      WHERE
        survey_sample_method_id = ${surveySampleMethodId}
      RETURNING
        *;
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
