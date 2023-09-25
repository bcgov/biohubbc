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

// This describes the a row in the database for Survey Block
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
    return response.rows || [];
  }

  /**
   * updates a survey Sample method.
   *
   * @param {PostSampleMethod} sample
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async updateSampleMethod(sample: PostSampleMethod): Promise<SampleMethodRecord> {
    const sql = SQL`
      UPDATE survey_sample_method
      SET
        survey_sample_site_id=${sample.survey_sample_site_id},
        method_lookup_id = ${sample.method_lookup_id},
        description=${sample.description}
      WHERE
        survey_sample_method_id = ${sample.survey_sample_method_id}
      RETURNING
        *;`;

    const response = await this.connection.sql(sql, SampleMethodRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey block', [
        'SampleMethodRepository->updateSampleMethod',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample method.
   *
   * @param {PostSampleMethod} sample
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async insertSampleMethod(sample: PostSampleMethod): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
    INSERT INTO survey_sample_method (
      survey_sample_site_id,
      method_lookup_id,
      description
    ) VALUES (
      ${sample.survey_sample_site_id},
      ${sample.method_lookup_id},
      ${sample.description}
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
   * @param {number} sampMethodId
   * @return {*}  {Promise<SampleMethodRecord>}
   * @memberof SampleMethodRepository
   */
  async deleteSampleMethodRecord(sampMethodId: number): Promise<SampleMethodRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_method
      WHERE
        survey_sample_method_id = ${sampMethodId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SampleMethodRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey block record', [
        'SampleMethodRepository->deleteSampleMethodRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
