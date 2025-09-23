import SQL from 'sql-template-strings';
import { SurveyFilterModel, SurveyFilterRecord } from '../database-models/survey-filter';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ISurveyAdvancedFilters } from '../models/survey-view';
import { BaseRepository } from './base-repository';

export interface PostSurveyFilter {
  survey_filter_id: number | null;
  system_user_id: number;
  name: string;
  conditions: ISurveyAdvancedFilters;
  description: string;
}

export class SurveyFilterRepository extends BaseRepository {
  /**
   * Get all filters assigned to the given user
   *
   * @param {number} systemUserId
   * @returns {Promise<SurveyFilter[]>}
   * @memberof SurveyFilterRepository
   */
  async getSurveyFiltersForSystemUser(systemUserId: number): Promise<SurveyFilterRecord[]> {
    const sql = SQL`
      SELECT 
        survey_filter_id,
        system_user_id,
        name,
        conditions,
        description
      FROM survey_filter
      WHERE system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql(sql, SurveyFilterRecord);

    return response.rows;
  }

  /**
   * Insert a new survey filter
   *
   * @param {PostSurveyFilter} filter
   * @returns {Promise<SurveyFilterModel>}
   * @memberof SurveyFilterRepository
   */
  async insertSurveyFilter(filter: PostSurveyFilter): Promise<SurveyFilterModel> {
    const sql = SQL`
      INSERT INTO survey_filter (
        system_user_id,
        name,
        description,
        conditions
      ) VALUES (
        ${filter.system_user_id},
        ${filter.name},
        ${filter.description},
        ${JSON.stringify(filter.conditions)}
      )
      RETURNING *;
    `;

    const response = await this.connection.sql(sql, SurveyFilterModel);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey filter', [
        'SurveyFilterRepository->insertSurveyFilter',
        'No rows returned'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update an existing survey filter
   *
   * @param {PostSurveyFilter} filter
   * @returns {Promise<SurveyFilterModel>}
   * @memberof SurveyFilterRepository
   */
  async updateSurveyFilter(filter: PostSurveyFilter): Promise<SurveyFilterModel> {
    const sql = SQL`
      UPDATE survey_filter
      SET
        name = ${filter.name},
        description = ${filter.description},
        conditions = ${JSON.stringify(filter.conditions)},
      WHERE
        survey_filter_id = ${filter.survey_filter_id}
      RETURNING *;
    `;

    const response = await this.connection.sql(sql, SurveyFilterModel);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey filter', [
        'SurveyFilterRepository->updateSurveyFilter',
        'No rows returned'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete a survey filter record
   *
   * @param {number} surveyFilterId
   * @param {number} systemUserId
   * @returns {Promise<SurveyFilterModel>}
   * @memberof SurveyFilterRepository
   */
  async deleteSurveyFilterRecord(surveyFilterId: number, systemUserId: number): Promise<SurveyFilterModel> {
    const sql = SQL`
      DELETE FROM survey_filter
      WHERE survey_filter_id = ${surveyFilterId}
      AND system_user_id = ${systemUserId}
      RETURNING *;
    `;

    const response = await this.connection.sql(sql, SurveyFilterModel);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey filter record', [
        'SurveyFilterRepository->deleteSurveyFilterRecord',
        'No rows returned'
      ]);
    }

    return response.rows[0];
  }
}
