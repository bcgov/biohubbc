import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import { getLogger } from '../utils/logger';
import { getKnex } from '../database/db';

export const SurveyStratum = z.object({
  name: z.string(),
  description: z.string()
});

export const SurveyStratumRecord = z.object({
  name: z.string(),
  description: z.string().nullable(),
  survey_id: z.number(),
  survey_stratum_id: z.number(),
  revision_count: z.number(),
  update_date: z.string().nullable()
});

export type SurveyStratumRecord = z.infer<typeof SurveyStratumRecord>;

export type SurveyStratum = z.infer<typeof SurveyStratum>;

export const SiteSelectionStrategies = z.object({
  strategies: z.array(z.string()),
  stratums: z.array(SurveyStratumRecord)
});

export type SiteSelectionStrategies = z.infer<typeof SiteSelectionStrategies>;

const defaultLog = getLogger('repositories/site-selection-strategy-repository');

/**
 * A repository class for accessing Survey site selection strategies and Stratums data.
 *
 * @export
 * @class SiteSelectionStrategyRepository
 * @extends {BaseRepository}
 */
export class SiteSelectionStrategyRepository extends BaseRepository {
  
  /**
   * Retreives the site selection strategies and stratums for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SiteSelectionStrategies>}
   * @memberof SurveyRepository
   */
  async getSiteSelectionStrategiesBySurveyId(surveyId: number): Promise<SiteSelectionStrategies> {
    defaultLog.debug({ label: 'getSiteSelectionStrategiesBySurveyId', surveyId });

    const strategiesQuery = getKnex()
      .select('ss.name')
      .from('survey_site_strategy as sss')
      .where('sss.survey_id', 1)
      .leftJoin('site_strategy as ss', 'ss.site_strategy_id', 'sss.site_strategy_id');

    const strategiesResponse = await this.connection.knex<{ name: string }>(strategiesQuery);
    const strategies = strategiesResponse.rows.map((row) => row.name);

    const stratumsQuery = getKnex().select().from('survey_stratum').where('survey_id', surveyId);

    const stratumsResponse = await this.connection.knex<SurveyStratumRecord>(stratumsQuery);
    const stratums = stratumsResponse.rows;

    return { strategies, stratums };
  }

  /**
   * Deletes all site selection strategies belonging to a survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof SurveyRepository
   */
  async deleteSurveySiteSelectionStrategies(surveyId: number): Promise<number> {
    defaultLog.debug({ label: 'deleteSurveySiteSelectionStrategies', surveyId });

    const deleteStatement = SQL`
      DELETE FROM 
        survey_site_strategy
      WHERE
      survey_id = ${surveyId}
      RETURNING *;
    `;

    const response = await this.connection.sql(deleteStatement);

    return response.rowCount;
  }

  /**
   * Inserts site selection strategies (by name) for a survey
   *
   * @param {number} surveyId
   * @param {string[]} strategies
   * @return {*}  {Promise<void>}
   * @memberof SurveyRepository
   */
  async insertSurveySiteSelectionStrategies(surveyId: number, strategies: string[]): Promise<void> {
    defaultLog.debug({ label: 'insertSurveySiteSelectionStrategies', surveyId, strategies });

    const insertQuery = SQL`
      WITH
        strategies
      AS (
        SELECT
          ss.site_strategy_id
        FROM
          site_strategy ss
        WHERE
          ss.name
        IN
          (`;

    strategies.forEach((strategy, index) => {
      insertQuery.append(`'${strategy}'`);
      if (index < strategies.length - 1) {
        insertQuery.append(', ');
      }
    });

    insertQuery.append(SQL`
          )
      )

      INSERT INTO
        survey_site_strategy (survey_id, site_strategy_id)
      (
        SELECT
          ${surveyId} AS survey_id,
          site_strategy_id
        FROM
          strategies
      )
      RETURNING *;
    `);

    const response = await this.connection.sql(insertQuery);

    if (response.rowCount !== strategies.length) {
      throw new ApiExecuteSQLError('Failed to insert survey site selection strategies', [
        'SurveyRepository->insertSurveySiteSelectionStrategies',
        `rowCount was ${response.rowCount}, expected rowCount = ${strategies.length}`
      ]);
    }
  }

  /**
   * Deletes the given survey stratums by ID
   *
   * @param {number[]} stratumIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyRepository
   */
  async deleteSurveyStratums(stratumIds: number[]): Promise<void> {
    defaultLog.debug({ label: 'deleteSurveyStratums', stratumIds });

    const deleteQuery = getKnex()
      .delete()
      .from('survey_stratum')
      .whereIn('survey_stratum_id', stratumIds)
      .returning('*');

    await this.connection.knex(deleteQuery, SurveyStratumRecord);
  }

  /**
   * Inserts the given survey stratums for the given survey
   *
   * @param {number} surveyId
   * @param {SurveyStratum[]} stratums
   * @return {*}  {Promise<SurveyStratumRecord[]>}
   * @memberof SurveyRepository
   */
  async insertSurveyStratums(surveyId: number, stratums: SurveyStratum[]): Promise<SurveyStratumRecord[]> {
    defaultLog.debug({ label: 'insertSurveyStratums', surveyId });

    const insertQuery = getKnex()
      .table('survey_stratum')
      .insert(
        stratums.map((stratum) => ({
          survey_id: surveyId,
          name: stratum.name,
          description: stratum.description
        }))
      )
      .returning('*');

    const response = await this.connection.knex(insertQuery, SurveyStratumRecord);

    if (response.rowCount !== stratums.length) {
      throw new ApiExecuteSQLError('Failed to insert survey stratums', [
        'SurveyRepository->insertSurveyStratums',
        `rowCount was ${response.rowCount}, expected rowCount = ${stratums.length}`
      ]);
    }

    return response.rows;
  }

  /**
   * Performs a batch update for survey stratum records
   *
   * @param {number} surveyId
   * @param {SurveyStratumRecord[]} stratums
   * @return {*}  {Promise<SurveyStratumRecord[]>}
   * @memberof SurveyRepository
   */
  async updateSurveyStratums(surveyId: number, stratums: SurveyStratumRecord[]): Promise<SurveyStratumRecord[]> {
    defaultLog.debug({ label: 'updateSurveyStratums', surveyId });

    const makeUpdateQuery = (stratum: SurveyStratumRecord) => {
      return getKnex()
        .table('survey_stratum')
        .update({
          survey_id: surveyId,
          name: stratum.name,
          description: stratum.description,
          update_date: 'now()'
        })
        .where('survey_stratum_id', stratum.survey_stratum_id)
        .returning('*');
    };

    const responses = await Promise.all(
      stratums.map((stratum) => this.connection.knex(makeUpdateQuery(stratum), SurveyStratumRecord))
    );

    const records = responses.reduce((acc: SurveyStratumRecord[], queryResult) => {
      return [...acc, ...queryResult.rows];
    }, []);

    if (records.length !== stratums.length) {
      throw new ApiExecuteSQLError('Failed to update survey stratums', [
        'SurveyRepository->updateSurveyStratums',
        `Total rowCount was ${records.length}, expected ${stratums.length} rows`
      ]);
    }

    return records;
  }
}
