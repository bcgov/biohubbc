import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface PostSurveyBlock {
  survey_block_id: number | null;
  survey_id: number;
  name: string;
  description: string;
}

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

export const SurveyBlockDetails = z.object({ sample_block_count: z.number() }).extend(SurveyBlockRecord.shape);
export type SurveyBlockDetails = z.infer<typeof SurveyBlockDetails>;
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
  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockDetails[]> {
    const sql = SQL`
    SELECT
        sb.survey_block_id,
        sb.survey_id,
        sb.name,
        sb.description,
        sb.create_date,
        sb.create_user,
        sb.update_date,
        sb.update_user,
        sb.revision_count,
        COUNT(ssb.survey_block_id)::integer AS sample_block_count
    FROM
        survey_block sb
    LEFT JOIN
        survey_sample_block ssb ON sb.survey_block_id = ssb.survey_block_id
    WHERE
        sb.survey_id = ${surveyId}
    GROUP BY
        sb.survey_block_id,
        sb.survey_id,
        sb.name,
        sb.description,
        sb.create_date,
        sb.create_user,
        sb.update_date,
        sb.update_user,
        sb.revision_count;
    `;

    const response = await this.connection.sql(sql, SurveyBlockDetails);

    console.log(response.rows);

    return response.rows;
  }

  /**
   * Updates a survey block record.
   *
   * @param {SurveyBlock} block
   * @return {*}  {Promise<void>}
   * @memberof SurveyBlockRepository
   */
  async updateSurveyBlock(block: PostSurveyBlock): Promise<SurveyBlockRecord> {
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
  async insertSurveyBlock(block: PostSurveyBlock): Promise<SurveyBlockRecord> {
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
