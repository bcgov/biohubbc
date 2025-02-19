import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { generateGeometryCollectionSQL } from '../utils/spatial-utils';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';
import { SurveyBlockRecord } from '../database-models/survey_block';

export interface PostSurveyBlock {
  survey_block_id: number | null;
  survey_id: number;
  name: string;
  description: string;
  geojson: Feature;
  assignment_id?: string
}

export interface PostSurveyBlocksRequest {
  blocks: PostSurveyBlock[];
}

// This describes the a row in the database for Survey Block
export const SurveyBlockWithCount = SurveyBlockRecord.extend({
  sample_block_count: z.number()
});
export type SurveyBlockWithCount = z.infer<typeof SurveyBlockWithCount>;

// This describes the a row in the database for Survey Block
export const SurveyBlockNonSpatial = SurveyBlockWithCount.omit({ geojson: true });
export type SurveyBlockNonSpatial = z.infer<typeof SurveyBlockNonSpatial>;

/**
 * A repository class for accessing Survey Block data.
 *
 * @export
 * @class SurveyBlockRepository
 * @extends {BaseRepository}
 */
export class SurveyBlockRepository extends BaseRepository {
  /**
   * Gets a specific survey block by its id
   *
   * @param {number} surveyId
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockWithCount>}
   * @memberof SurveyBlockRepository
   */
  async getSurveyBlockById(surveyId: number, surveyBlockId: number): Promise<SurveyBlockWithCount> {
    const knex = getKnex();

    const queryBuilder = knex('survey_block as sb')
      .select([
        'sb.survey_block_id',
        'sb.survey_id',
        'sb.name',
        'sb.description',
        'sb.geojson',
        'sb.revision_count',
        knex.raw('COUNT(ssb.survey_block_id)::integer AS sample_block_count')
      ])
      .leftJoin('survey_sample_block as ssb', 'sb.survey_block_id', 'ssb.survey_block_id')
      .where('sb.survey_id', surveyId)
      .where('sb.survey_block_id', surveyBlockId)
      .groupBy('sb.survey_block_id', 'sb.survey_id', 'sb.name', 'sb.description', 'sb.geojson', 'sb.revision_count');

    const response = await this.connection.knex(queryBuilder, SurveyBlockWithCount);

    return response.rows[0];
  }

  /**
   * Gets all Survey Block Records for a given survey id.
   *
   * @param {number} surveyId
   * @param {{
   *       keyword?: string;
   *       surveyBlockIds?: number[];
   *       pagination?: ApiPaginationOptions;
   *     }} [options]
   * @return {*}  {Promise<SurveyBlockNonSpatial[]>}
   * @memberof SurveyBlockRepository
   */
  async getSurveyBlocksForSurveyId(
    surveyId: number,
    options?: {
      keyword?: string;
      surveyBlockIds?: number[];
      pagination?: ApiPaginationOptions;
    }
  ): Promise<SurveyBlockNonSpatial[]> {
    const knex = getKnex();

    const queryBuilder = knex('survey_block as sb')
      .select([
        'sb.survey_block_id',
        'sb.survey_id',
        'sb.name',
        'sb.description',
        'sb.revision_count',
        knex.raw('COUNT(ssb.survey_block_id)::integer AS sample_block_count')
      ])
      .leftJoin('survey_sample_block as ssb', 'sb.survey_block_id', 'ssb.survey_block_id')
      .where('sb.survey_id', surveyId)
      .groupBy('sb.survey_block_id', 'sb.survey_id', 'sb.name', 'sb.description', 'sb.geojson', 'sb.revision_count');

    if (options?.surveyBlockIds && options?.surveyBlockIds.length > 0) {
      queryBuilder.whereIn('sb.survey_block_id', options.surveyBlockIds);
    }

    if (options?.keyword) {
      queryBuilder.andWhere((qb) => {
        qb.orWhere('sb.name', 'ilike', `%${options.keyword}%`).orWhere(
          'sb.description',
          'ilike',
          `%${options.keyword}%`
        );
      });
    }

    if (options?.pagination) {
      const { limit, page, sort, order } = options.pagination;

      if (limit) {
        queryBuilder.limit(limit).offset((page - 1) * limit);
      }

      if (sort && order) {
        queryBuilder.orderBy(sort, order);
      }
    }

    const response = await this.connection.knex(queryBuilder, SurveyBlockNonSpatial);

    return response.rows;
  }

  /**
   * Returns the total count of blocks belonging to the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SurveyBlockRepository
   */
  async getSurveyBlocksCountBySurveyId(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        COUNT(*)::integer AS count
      FROM
        survey_block
      WHERE 
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey block count', [
        'SurveyBlockRepository->getSurveyBlocksCountBySurveyId',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  /**
   * Updates a survey block record.
   *
   * @param {SurveyBlock} block
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockRepository
   */
  async updateSurveyBlock(block: PostSurveyBlock): Promise<SurveyBlockRecord> {
    const sql = SQL`
      UPDATE survey_block 
      SET 
        name = ${block.name}, 
        description = ${block.description}, 
        survey_id = ${block.survey_id},
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
        survey_id,
        name,
        description,
        geojson,
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
          )
    RETURNING 
      survey_block_id,
      survey_id,
      name,
      description,
      geojson,
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
   * @param {number} surveyId
   * @param {number} surveyBlockId
   * @return {*}  {Promise<SurveyBlockRecord>}
   * @memberof SurveyBlockRepository
   */
  async deleteSurveyBlockRecord(surveyId: number, surveyBlockId: number): Promise<SurveyBlockRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_block sb
      USING
        survey s
      WHERE
        sb.survey_block_id = ${surveyBlockId}
        AND sb.survey_id = s.survey_id
        AND sb.survey_id = ${surveyId}
      RETURNING
        sb.survey_block_id,
        sb.survey_id,
        sb.name,
        sb.description,
        sb.revision_count;
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
