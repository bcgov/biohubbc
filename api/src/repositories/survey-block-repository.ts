import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { BaseRepository } from './base-repository';

export interface PostSurveyBlock {
  survey_block_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature[];
}

// This describes the a row in the database for Survey Block
export const SurveyBlockRecord = z.object({
  survey_block_id: z.number(),
  name: z.string(),
  description: z.string(),
  revision_count: z.number()
});
export type SurveyBlockRecord = z.infer<typeof SurveyBlockRecord>;

// This describes the a row in the database for Survey Block
export const SurveyBlockRecordWithCount = z.object({
  survey_block_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string(),
  geometry: z.record(z.any()).nullable(),
  geography: z.string(),
  geojson: z.any(),
  revision_count: z.number(),
  sample_block_count: z.number()
});
export type SurveyBlockRecordWithCount = z.infer<typeof SurveyBlockRecordWithCount>;

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
  async getSurveyBlocksForSurveyId(surveyId: number): Promise<SurveyBlockRecordWithCount[]> {
    const sql = SQL`
    SELECT
        sb.survey_block_id,
        sb.survey_id,
        sb.name,
        sb.description,
        geometry,
        geography,
        geojson,
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
        sb.geometry,
        sb.geography,
        sb.geojson,
        sb.description,
        sb.revision_count;
    `;

    const response = await this.connection.sql(sql, SurveyBlockRecordWithCount);

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
        survey_id=${block.survey_id},
        geojson = ${JSON.stringify(block.geojson)},
        geography = public.geography(
                      public.ST_Force2D(
                        public.ST_SetSRID(`.append(generateGeometryCollectionSQL(block.geojson)).append(`, 4326)
                      )
                    )
      WHERE 
        survey_block_id = ${block.survey_block_id}
      RETURNING 
        survey_block_id,
        name,
        description,
        revision_count;
    `);
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
      description,
      description,
      geojson,
      geography
    ) VALUES (
      ${block.survey_id},
      ${block.name},
      ${block.description},
      ${JSON.stringify(block.geojson)},
    public.geography(
            public.ST_Force2D(
              public.ST_SetSRID(`.append(generateGeometryCollectionSQL(block.geojson)).append(`, 4326)
            )
          )
    RETURNING 
      survey_block_id,
      name,
      description,
      revision_count;
  `);
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
        survey_block_id,
        name,
        description,
        revision_count;
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
