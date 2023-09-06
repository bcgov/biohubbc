import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const SurveyBlock = z.object({
  survey_block_id: z.number().nullable(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string()
});

export type SurveyBlock = z.infer<typeof SurveyBlock>;

// This describes the a row in the database for Survey Block
export const SurveyBlockRecord = z.object({
  survey_block_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SurveyBlockRecord = z.infer<typeof SurveyBlockRecord>;

/**
 * A repository class for accessing Survey Block data.
 *
 * @export
 * @class SurveyBlockRepository
 * @extends {BaseRepository}
 */
export class SurveyBlockRepository extends BaseRepository {
  /**
   * Gets all Survey Block Records for a given survey id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyBlockRecord[]>}
   * @memberof SurveyBlockRepository
   */
  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecord[]> {
    const sql = SQL`
      SELECT * 
      FROM survey_block
      WHERE survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sql, SurveyBlockRecord);
    return response.rows || [];
  }

  /**
   * Updates a survey block record.
   *
   * @param {SurveyBlock} block
   * @return {*}  {Promise<void>}
   * @memberof SurveyBlockRepository
   */
  async updateSurveyBlock(block: SurveyBlock): Promise<SurveyBlockRecord> {
    const sql = SQL`
      UPDATE survey_block 
      SET 
        name = ${block.name}, 
        description = ${block.description}, 
        survey_id=${block.survey_id} 
      WHERE 
        survey_block_id = ${block.survey_block_id}
      RETURNING
        *;
    `;
    const response = await this.connection.sql(sql, SurveyBlockRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey block', [
        'SurveyBlockRepository->updateSurveyBlock',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a survey block record.
   *
   * @param {SurveyBlock} block
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockRepository
   */
  async insertSurveyBlock(block: SurveyBlock): Promise<SurveyBlockRecord> {
    const sql = SQL`
    INSERT INTO survey_block (
      survey_id,
      name,
      description
    ) VALUES (
      ${block.survey_id},
      ${block.name},
      ${block.description}
    )
    RETURNING 
      *;
  `;
    const response = await this.connection.sql(sql, SurveyBlockRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey block', [
        'SurveyBlockRepository->postSurveyBlock',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes a survey block record.
   *
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockRepository
   */
  async deleteSurveyBlockRecord(surveyBlockId: number): Promise<SurveyBlockRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_block
      WHERE
        survey_block_id = ${surveyBlockId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyBlockRecord);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey block record', [
        'SurveyBlockRepository->deleteSurveyBlockRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
