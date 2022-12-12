import SQL, { SQLStatement } from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PutFundingSource } from '../models/project-update';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {
  async getProjectSurveyFundingSourceIds(
    projectId: number
  ): Promise<
    {
      project_funding_source_id: number;
      survey_id: number;
    }[]
  > {
    const sqlStatement = SQL`
    SELECT
      sfs.project_funding_source_id,
      sfs.survey_id
    FROM
      survey_funding_source sfs
    LEFT JOIN
      project_funding_source pfs
    ON
      sfs.project_funding_source_id = pfs.project_funding_source_id
    WHERE
      pfs.project_id = ${projectId};
  `;

    const response = await this.connection.sql<{
      project_funding_source_id: number;
      survey_id: number;
    }>(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project and survey funding sources by Id', [
        'ProjectRepository->getProjectSurveyFundingSourceIds',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteSurveyFundingSourceConnectionToProject(projectFundingSourceIds: number[]) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source sfs
    WHERE
      sfs.project_funding_source_id
    IN
      ( ${projectFundingSourceIds[0]}`;

    for (let i = 1; i < projectFundingSourceIds.length; i++) {
      sqlStatement.append(`, ${projectFundingSourceIds[i]}`);
    }
    sqlStatement.append(`)
    RETURNING survey_id;`);

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete survey funding sources by id', [
        'ProjectRepository->deleteSurveyFundingSourceConnectionToProject',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteAllProjectFundingSource(projectId: number) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_funding_source
    WHERE
      project_id = ${projectId};
  `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete all project funding source', [
        'ProjectRepository->deleteAllProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async putProjectFundingSource(
    fundingSource: PutFundingSource,
    projectId: number
  ): Promise<{ project_funding_source_id: number }> {
    const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_funding_source (
      project_id,
      investment_action_category_id,
      funding_source_project_id,
      funding_amount,
      funding_start_date,
      funding_end_date
    ) VALUES (
      ${projectId},
      ${fundingSource.investment_action_category},
      ${fundingSource.agency_project_id},
      ${fundingSource.funding_amount},
      ${fundingSource.start_date},
      ${fundingSource.end_date}
    )
    RETURNING
      project_funding_source_id;
  `;

    const response = await this.connection.sql<{ project_funding_source_id: number }>(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to update project funding source', [
        'ProjectRepository->putProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async insertSurveyFundingSource(fundingSourceId: number, surveyId: number) {
    const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_funding_source (
      survey_id,
      project_funding_source_id
    ) VALUES (
      ${surveyId},
      ${fundingSourceId}
    );
  `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to insert survey funding source', [
        'ProjectRepository->insertSurveyFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }
}
