import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export type InsertSampleBlockRecord = Pick<SampleBlockRecord, 'survey_sample_site_id' | 'survey_block_id'>;

export type UpdateSampleBlockRecord = Pick<
  SampleBlockRecord,
  'survey_sample_block_id' | 'survey_sample_site_id' | 'survey_block_id'
>;

// This describes a row in the database for Survey Sample Block
export const SampleBlockRecord = z.object({
  survey_sample_block_id: z.number(),
  survey_sample_site_id: z.number(),
  survey_block_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number(),
  name: z.string(),
  description: z.string()
});
export type SampleBlockRecord = z.infer<typeof SampleBlockRecord>;

/**
 * Sample Block Repository
 *
 * @export
 * @class sampleBlockRepository
 * @extends {BaseRepository}
 */
export class SampleBlockRepository extends BaseRepository {
  /**
   * Gets all survey Sample Blocks.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof sampleBlockRepository
   */
  async getSampleBlocksForSurveyBlockId(surveyBlockId: number): Promise<SampleBlockRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_block
      WHERE survey_block_id = ${surveyBlockId};
    `;

    const response = await this.connection.sql(sql, SampleBlockRecord);
    return response.rows;
  }

  /**
   * Gets all survey Sample Blocks.
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof sampleBlockRepository
   */
  async getSampleBlocksCountForSurveyBlockId(surveyBlockId: number): Promise<{ sampleCount: number }> {
    const sql = SQL`
      SELECT COUNT(*) as sampleCount
      FROM survey_sample_block
      WHERE survey_block_id = ${surveyBlockId};
    `;

    const response = await this.connection.sql(sql, SampleBlockRecord);
    console.log(response);
    const sampleCount = Number(response.rows[0]);
    // console.log(sampleCount);
    return { sampleCount };
  }

  /**
   * updates a survey Sample block.
   *
   * @param {UpdateSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async updateSampleBlock(sampleBlock: UpdateSampleBlockRecord): Promise<SampleBlockRecord> {
    const sql = SQL`
      UPDATE survey_sample_block
      SET
        survey_sample_site_id= ${sampleBlock.survey_sample_site_id},
        survey_block_id = ${sampleBlock.survey_block_id}
      RETURNING
        *;`;

    const response = await this.connection.sql(sql);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update sample block', [
        'sampleBlockRepository->updateSampleBlock',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new survey Sample block.
   *
   * @param {InsertSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async insertSampleBlock(sampleBlock: InsertSampleBlockRecord): Promise<SampleBlockRecord> {
    console.log(sampleBlock);
    const sqlStatement = SQL`
    INSERT INTO survey_sample_block (
      survey_sample_site_id,
      survey_block_id
    ) VALUES (
      ${sampleBlock.survey_sample_site_id},
      ${sampleBlock.survey_block_id}
      )
      RETURNING
        *;
      `;

    console.log(sqlStatement);

    const response = await this.connection.sql(sqlStatement, SampleBlockRecord);
    console.log(response);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample block', [
        'sampleBlockRepository->insertSampleBlock',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    console.log(response);

    return response.rows[0];
  }

  /**
   * Deletes a survey Sample block.
   *
   * @param {number} surveySampleBlockId
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async deleteSampleBlockRecord(surveySampleBlockId: number): Promise<SampleBlockRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_sample_block
      WHERE
        survey_sample_block_id = ${surveySampleBlockId}
      RETURNING
        *;
    `;

    // todo: reconcile types
    const response = await this.connection.sql(sqlStatement); //, SampleBlockRecord)

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample block', [
        'sampleBlockRepository->deleteSampleBlockRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Gets all survey Sample Blocks for specific Sample Site.
   *
   * @param {number} surveySampleSiteId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof sampleBlockRepository
   */
  async getSampleBlocksForSurveySampleSiteId(surveySampleSiteId: number): Promise<SampleBlockRecord[]> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_block
      WHERE survey_sample_site_id = ${surveySampleSiteId};
    `;

    console.log(sql);

    
    // todo: reconcile types
    const response = await this.connection.sql(sql); //, SampleBlockRecord
    console.log(response)
    return response.rows;
  }
}