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
  async getProjectFundingSourceIds(
    projectId: number
  ): Promise<
    {
      project_funding_source_id: number;
    }[]
  > {
    const sqlStatement = SQL`
    SELECT
      pfs.project_funding_source_id
    FROM
      project_funding_source pfs
    WHERE
      pfs.project_id = ${projectId};
  `;

    const response = await this.connection.sql<{
      project_funding_source_id: number;
    }>(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project funding sources by Id', [
        'ProjectRepository->getProjectFundingSourceIds',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteSurveyFundingSourceConnectionToProject(projectFundingSourceId: number) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source sfs
    WHERE
      sfs.project_funding_source_id = ${projectFundingSourceId}
    RETURNING survey_id;`;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete survey funding source by id', [
        'ProjectRepository->deleteSurveyFundingSourceConnectionToProject',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteProjectFundingSource(projectFundingSourceId: number) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_funding_source
    WHERE
        project_funding_source_id = ${projectFundingSourceId};
  `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete project funding source', [
        'ProjectRepository->deleteProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async updateProjectFundingSource(
    fundingSource: PutFundingSource,
    projectId: number
  ): Promise<{ project_funding_source_id: number }> {
    const sqlStatement: SQLStatement = SQL`
    UPDATE
        project_funding_source
    SET
      project_id =  ${projectId},
      investment_action_category_id = ${fundingSource.investment_action_category},
      funding_source_project_id = ${fundingSource.agency_project_id},
      funding_amount = ${fundingSource.funding_amount},
      funding_start_date = ${fundingSource.start_date},
      funding_end_date = ${fundingSource.end_date}
    WHERE
      project_funding_source_id = ${fundingSource.id}
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

  async insertProjectFundingSource(
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
      throw new ApiExecuteSQLError('Failed to insert project funding source', [
        'ProjectRepository->putProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }
}
