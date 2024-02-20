import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export type InsertSampleStratumRecord = Pick<SampleStratumRecord, 'survey_sample_site_id' | 'survey_stratum_id'>;

export type UpdateSampleStratumRecord = Pick<
  SampleStratumRecord,
  'survey_sample_stratum_id' | 'survey_sample_site_id' | 'survey_stratum_id'
>;

// This describes a row in the database for Survey Sample Stratum
export const SampleStratumRecord = z.object({
  survey_sample_stratum_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_stratum_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SampleStratumRecord = z.infer<typeof SampleStratumRecord>;

// This describes a row in the database for Survey Sample Stratum
export const SampleStratumDetails = z.object({
  survey_sample_stratum_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_stratum_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  name: z.string(),
  description: z.string()
});
export type SampleStratumDetails = z.infer<typeof SampleStratumDetails>;

/**
 * Sample Stratum Repository
 *
 * @export
 * @class sampleStratumRepository
 * @extends {BaseRepository}
 */
export class SampleStratumRepository extends BaseRepository {
  /**
   * Gets all survey Sample Stratums.
   *
   * @param {number} surveyStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof sampleStratumRepository
   */
  async getSampleStratumsForSurveyStratumId(surveyStratumId: number): Promise<SampleStratumRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_stratum
      WHERE survey_stratum_id = ${surveyStratumId};
    `;

    const response = await this.connection.sql(sql, SampleStratumRecord);
    return response.rows;
  }

  /**
   * Gets all survey Sample Stratums.
   *
   * @param {number} surveyStratumId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof sampleStratumRepository
   */
  async getSampleStratumsCountForSurveyStratumId(surveyStratumId: number): Promise<{ sampleCount: number }> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_stratum
      WHERE survey_stratum_id = ${surveyStratumId};
    `;

    const response = await this.connection.sql(sql, SampleStratumRecord);

    const sampleCount = Number(response.rowCount);
  
    return { sampleCount };
  }

  /**
   * updates a survey Sample stratum.
   *
   * @param {UpdateSampleStratumRecord} sampleStratum
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof sampleStratumRepository
   */
  async updateSampleStratum(sampleStratum: UpdateSampleStratumRecord): Promise<SampleStratumRecord> {
    const sql = SQL`
      UPDATE survey_sample_stratum
      SET
        survey_sample_site_id= ${sampleStratum.survey_sample_site_id},
        survey_stratum_id = ${sampleStratum.survey_stratum_id}
      RETURNING
        *;`;

    const response = await this.connection.sql(sql);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample stratum', [
        'sampleStratumRepository->updateSampleStratum',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample stratum.
   *
   * @param {InsertSampleStratumRecord} sampleStratum
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof sampleStratumRepository
   */
  async insertSampleStratum(sampleStratum: InsertSampleStratumRecord): Promise<SampleStratumRecord> {
    console.log(sampleStratum);
    const sqlStatement = SQL`
    INSERT INTO survey_sample_stratum (
      survey_sample_site_id,
      survey_stratum_id
    ) VALUES (
      ${sampleStratum.survey_sample_site_id},
      ${sampleStratum.survey_stratum_id}
      )
      RETURNING
        *;
      `;

    console.log(sqlStatement);

    const response = await this.connection.sql(sqlStatement, SampleStratumRecord);
    console.log(response);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample stratum', [
        'sampleStratumRepository->insertSampleStratum',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    console.log(response);

    return response.rows[0];
  }

  /**
   * Deletes a survey Sample stratum.
   *
   * @param {number} surveySampleStratumId
   * @return {*}  {Promise<SampleStratumRecord>}
   * @memberof sampleStratumRepository
   */
  async deleteSampleStratumRecord(surveySampleStratumId: number): Promise<SampleStratumRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_stratum
      WHERE
        survey_sample_stratum_id = ${surveySampleStratumId}
      RETURNING
        *;
    `;

    // todo: reconcile types
    const response = await this.connection.sql(sqlStatement); //, SampleStratumRecord)

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample stratum', [
        'sampleStratumRepository->deleteSampleStratumRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets all survey Sample Stratums for specific Sample Site.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleStratumRecord[]>}
   * @memberof sampleStratumRepository
   */
  async getSampleStratumsForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleStratumRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_stratum
      WHERE survey_sample_site_id = ${surveySampleSiteId};
    `;

    console.log(sql);

    // todo: reconcile types
    const response = await this.connection.sql(sql); //, SampleStratumRecord
    console.log(response);
    return response.rows;
  }
}
