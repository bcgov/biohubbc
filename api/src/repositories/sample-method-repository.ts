import SQL from 'sql-template-strings';
import { z } from 'zod';
import { SurveySampleMethodModel, SurveySampleMethodRecord } from '../database-models/survey_sample_method';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ICreateSamplingPeriodData, UpdateSampleMethodObject } from '../models/sample-period';
import { BaseRepository } from './base-repository';
import { UpdateSamplePeriodRecord } from './sample-period-repository';

/**
 * Insert object for a single sample method record.
 */
export type InsertSampleMethodRecord = Pick<
  SurveySampleMethodRecord,
  'survey_sample_site_id' | 'method_technique_id' | 'description' | 'method_response_metric_id'
> & { sample_periods: ICreateSamplingPeriodData[] };

/**
 * Update object for a single sample method record.
 */
export type UpdateSampleMethodRecord = Pick<
  SurveySampleMethodRecord,
  | 'survey_sample_method_id'
  | 'survey_sample_site_id'
  | 'method_technique_id'
  | 'description'
  | 'method_response_metric_id'
> & { sample_periods: UpdateSamplePeriodRecord[] };

/**
 * A survey_sample_method detail object.
 */
export const SampleMethodDetails = SurveySampleMethodModel.extend({
  technique: z.object({
    method_technique_id: z.number(),
    name: z.string(),
    description: z.string().nullable()
  })
});
export type SampleMethodDetails = z.infer<typeof SampleMethodDetails>;

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
   * @return {*}  {Promise<SurveySampleMethodModel[]>}
   * @memberof SampleMethodRepository
   */
  async getSampleMethodsForSurveySampleSiteId(
    surveyId: number,
    surveySampleSiteId: number
  ): Promise<SurveySampleMethodModel[]> {
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

    const response = await this.connection.sql(sql, SurveySampleMethodModel);
    return response.rows;
  }

  /**
   * Gets count of sample methods associated with one or more method technique Ids
   *
   * @param {number[]} techniqueIds
   * @return {*}  {Promise<number>}
   * @memberof SampleMethodRepository
   */
  async getSampleMethodsCountForTechniqueIds(techniqueIds: number[]): Promise<number> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select(knex.raw('COUNT(*)::integer AS count'))
      .from('survey_sample_method')
      .whereIn('method_technique_id', techniqueIds);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
  }

  /**
   * updates a survey Sample method.
   *
   * @param {UpdateSampleMethodObject} sampleMethod
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodRepository
   */
  async updateSampleMethod(surveyId: number, sampleMethod: UpdateSampleMethodObject): Promise<SurveySampleMethodModel> {
    const sql = SQL`
      UPDATE survey_sample_method ssm
      SET
          method_technique_id = ${sampleMethod.method_technique_id}
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
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodRepository
   */
  async insertSampleMethod(sampleMethod: InsertSampleMethodRecord): Promise<SurveySampleMethodModel> {
    const sqlStatement = SQL`
      INSERT INTO survey_sample_method (
        survey_sample_site_id,
        method_technique_id,
        description,
        method_response_metric_id
      ) VALUES (
        ${sampleMethod.survey_sample_site_id},
        ${sampleMethod.method_technique_id},
        ${sampleMethod.description},
        ${sampleMethod.method_response_metric_id}
        )
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SurveySampleMethodModel);

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
   * @return {*}  {Promise<SurveySampleMethodModel>}
   * @memberof SampleMethodRepository
   */
  async deleteSampleMethodRecord(surveyId: number, surveySampleMethodId: number): Promise<SurveySampleMethodModel> {
    const sqlStatement = SQL`
      DELETE FROM survey_sample_method
      USING survey_sample_site sss
      WHERE
          survey_sample_method.survey_sample_site_id = sss.survey_sample_site_id
          AND survey_sample_method_id = ${surveySampleMethodId}
          AND survey_id = ${surveyId}
      RETURNING survey_sample_method.*;
    `;

    const response = await this.connection.sql(sqlStatement, SurveySampleMethodModel);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete sample method', [
        'SampleMethodRepository->deleteSampleMethodRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
