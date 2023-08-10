import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ICreateFundingSource, IFundingSourceSearchParams } from '../services/funding-source-service';
import { BaseRepository } from './base-repository';

const FundingSource = z.object({
  funding_source_id: z.number(),
  name: z.string(),
  description: z.string(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  revision_count: z.number().optional()
});

export type FundingSource = z.infer<typeof FundingSource>;

const FundingSourceBasicSupplementaryData = z.object({
  survey_reference_count: z.number(),
  survey_reference_amount_total: z.number()
});

export type FundingSourceBasicSupplementaryData = z.infer<typeof FundingSourceBasicSupplementaryData>;

const SurveyFundingSource = z.object({
  survey_funding_source_id: z.number(),
  survey_id: z.number(),
  funding_source_id: z.number(),
  amount: z.number(),
  revision_count: z.number().optional()
});

export type SurveyFundingSource = z.infer<typeof SurveyFundingSource>;

export class FundingSourceRepository extends BaseRepository {
  /**
   * Fetch all funding sources.
   *
   * @return {*}  {Promise<FundingSource[]>}
   * @memberof BaseRepository
   */
  async getFundingSources(searchParams: IFundingSourceSearchParams): Promise<FundingSource[]> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .select(['funding_source_id', 'name', 'description', 'start_date', 'end_date', 'revision_count'])
      .from('funding_source');

    if (searchParams.name) {
      queryBuilder.andWhere('name', searchParams.name);
    }

    const response = await this.connection.knex(queryBuilder, FundingSource);

    return response.rows;
  }

  async hasFundingSourceNameBeenUsed(name: string): Promise<boolean> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        funding_source
      WHERE
        LOWER(name) = '${name.toLowerCase()}';
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);
    return response.rowCount > 0;
  }

  async postFundingSource(data: ICreateFundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
    const sql = SQL`
      INSERT INTO funding_source (
        name,
        description,
        start_date,
        end_date,
        record_effective_date
      ) VALUES (
        ${data.name},
        ${data.description},
        ${data.start_date},
        ${data.end_date},
         NOW()
      )
      RETURNING
        funding_source_id;
    `;
    const response = await this.connection.sql(sql, FundingSource.pick({ funding_source_id: true }));
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Funding Source record', [
        'FundingSourceRepository->insertFundingSource',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Fetch a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSource>}
   * @memberof FundingSourceRepository
   */
  async getFundingSource(fundingSourceId: number): Promise<FundingSource> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        funding_source
      WHERE
        funding_source_id = ${fundingSourceId};
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get funding source', [
        'FundingSourceRepository->getFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update a single funding source.
   *
   * @param {FundingSource} fundingSource
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceRepository
   */
  async putFundingSource(fundingSource: FundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
    const sqlStatement = SQL`
      UPDATE
        funding_source
      SET
        name = ${fundingSource.name},
        description = ${fundingSource.description}
      WHERE
        funding_source_id = ${fundingSource.funding_source_id}
      AND
        revision_count = ${fundingSource.revision_count || 0}
      RETURNING
        funding_source_id;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource.pick({ funding_source_id: true }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update funding source', [
        'FundingSourceRepository->putFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceRepository
   */
  async deleteFundingSource(fundingSourceId: number): Promise<Pick<FundingSource, 'funding_source_id'>> {
    const sqlStatement = SQL`
      DELETE
      FROM
        funding_source
      WHERE
        funding_source_id = ${fundingSourceId}
      RETURNING
        funding_source_id;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource.pick({ funding_source_id: true }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete funding source', [
        'FundingSourceRepository->deleteFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Fetch basic supplementary data for a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSourceBasicSupplementaryData>}
   * @memberof FundingSourceRepository
   */
  async getFundingSourceBasicSupplementaryData(fundingSourceId: number): Promise<FundingSourceBasicSupplementaryData> {
    const sqlStatement = SQL`
      SELECT 
        COUNT(survey_funding_source.funding_source_id)::int as survey_reference_count, 
        COALESCE(SUM(survey_funding_source.amount)::numeric::int, 0) as survey_reference_amount_total
      FROM
        funding_source 
      LEFT JOIN 
        survey_funding_source 
      ON 
        funding_source.funding_source_id = survey_funding_source.funding_source_id
      WHERE
        funding_source.funding_source_id = ${fundingSourceId};
    `;

    const response = await this.connection.sql(sqlStatement, FundingSourceBasicSupplementaryData);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get funding source basic supplementary data', [
        'FundingSourceRepository->getFundingSourceBasicSupplementaryData',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /*
   * SURVEY FUNDING FUNCTIONS
   */

  /**
   * Fetch a single survey funding source by survey id and funding source id.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @return {*}  {Promise<SurveyFundingSource>}
   * @memberof FundingSourceRepository
   */
  async getSurveyFundingSourceByFundingSourceId(
    surveyId: number,
    fundingSourceId: number
  ): Promise<SurveyFundingSource> {
    const sqlStatement = SQL`
      SELECT
        *,
        amount::numeric::int
      FROM
        survey_funding_source
      WHERE
        survey_id = ${surveyId}
      AND
        funding_source_id = ${fundingSourceId};
    `;
    const response = await this.connection.sql(sqlStatement, SurveyFundingSource);
    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get survey funding source', [
        'FundingSourceRepository->getSurveyFundingSourceByFundingSourceId',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
    return response.rows[0];
  }

  /**
   * Fetch all survey funding sources by survey id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyFundingSource[]>}
   * @memberof FundingSourceRepository
   */
  async getSurveyFundingSources(surveyId: number): Promise<SurveyFundingSource[]> {
    const sqlStatement = SQL`
      SELECT
        *,
        amount::numeric::int
      FROM
        survey_funding_source
      WHERE
        survey_id = ${surveyId};
    `;
    const response = await this.connection.sql(sqlStatement, SurveyFundingSource);
    return response.rows;
  }

  /**
   * Insert a new survey funding source record into survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @param {number} amount
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceRepository
   */
  async postSurveyFundingSource(surveyId: number, fundingSourceId: number, amount: number): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_funding_source (
        survey_id,
        funding_source_id,
        amount
      ) VALUES (
        ${surveyId},
        ${fundingSourceId},
        ${amount}
      );
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert survey funding source', [
        'FundingSourceRepository->postSurveyFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Update a survey funding source record in survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @param {number} amount
   * @param {number} revision_count
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceRepository
   */
  async putSurveyFundingSource(
    surveyId: number,
    fundingSourceId: number,
    amount: number,
    revision_count: number
  ): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        survey_funding_source
      SET
        amount = ${amount},
        revision_count = ${revision_count}
      WHERE
        survey_id = ${surveyId}
      AND
        funding_source_id = ${fundingSourceId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update survey funding source', [
        'FundingSourceRepository->putSurveyFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }

  /**
   * Delete a survey funding source record from survey_funding_source.
   *
   * @param {number} surveyId
   * @param {number} fundingSourceId
   * @return {*}  {Promise<void>}
   * @memberof FundingSourceRepository
   */
  async deleteSurveyFundingSource(surveyId: number, fundingSourceId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE
      FROM
        survey_funding_source
      WHERE
        survey_id = ${surveyId}
      AND
        funding_source_id = ${fundingSourceId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete survey funding source', [
        'FundingSourceRepository->deleteSurveyFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }
  }
}
