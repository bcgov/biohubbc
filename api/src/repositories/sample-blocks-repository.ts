import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
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
  revision_count: z.number()
});
export type SampleBlockRecord = z.infer<typeof SampleBlockRecord>;

// This describes a row in the database for Survey Sample Block
export const SampleBlockDetails = z.object({
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
export type SampleBlockDetails = z.infer<typeof SampleBlockDetails>;

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
   * @param {number} surveyBlockId
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
   * Gets count of all Sample Block records for a given Survey Block 
   * 
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SampleBlockRecord[]>}
   * @memberof sampleBlockRepository
   */
  async getSampleBlocksCountForSurveyBlockId(surveyBlockId: number): Promise<{ sampleCount: number }> {
    const sql = SQL`
      SELECT *
      FROM survey_sample_block
      WHERE survey_block_id = ${surveyBlockId};
    `;

    const response = await this.connection.sql(sql, SampleBlockRecord);

    const sampleCount = Number(response.rowCount);

    return { sampleCount };
  }

  /**
   * Inserts a new survey Sample block.
   *
   * @param {InsertSampleBlockRecord} sampleBlock
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async insertSampleBlock(sampleBlock: InsertSampleBlockRecord): Promise<SampleBlockRecord> {
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

    const response = await this.connection.sql(sqlStatement, SampleBlockRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert sample block', [
        'sampleBlockRepository->insertSampleBlock',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes all Sample Blocks referencing a given Survey Block
   *
   * @param {number} surveyBlockIds
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async deleteSampleBlockRecordsByBlockIds(surveyBlockIds: number[]): Promise<SampleBlockRecord[]> {
    const queryBuilder = getKnex()
      .delete()
      .from('survey_sample_block')
      .whereIn('survey_block_id', surveyBlockIds)
      .returning('*');

    const response = await this.connection.knex(queryBuilder, SampleBlockRecord);

    return response.rows;
  }
  /**
   * Deletes all Sample Block records in the array
   *
   * @param {number} surveySampleBlockIds
   * @return {*}  {Promise<SampleBlockRecord>}
   * @memberof sampleBlockRepository
   */
  async deleteSampleBlockRecords(surveySampleBlockIds: number[]): Promise<SampleBlockRecord[]> {
    const queryBuilder = getKnex()
      .delete()
      .from('survey_sample_block')
      .whereIn('survey_sample_block_id', surveySampleBlockIds)
      .returning('*');

    const response = await this.connection.knex(queryBuilder, SampleBlockRecord);

    return response.rows;
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

    const response = await this.connection.sql(sql, SampleBlockRecord)

    return response.rows;
  }
}
