import SQL from 'sql-template-strings';
import { PROJECT_ROLE } from '../constants/roles';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface IPermitModel {
  permit_id: number;
  survey_id: number | null;
  number: string;
  type: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

/**
 * A repository class for accessing permit data.
 *
 * @export
 * @class PermitRepository
 * @extends {BaseRepository}
 */
export class PermitRepository extends BaseRepository {
  /**
   * Fetch permit records by survey_id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<IPermitModel>}
   * @memberof PermitRepository
   */
  async getPermitBySurveyId(surveyId: number): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
      SELECT
        p.*
      FROM
        permit p
      WHERE
        p.survey_id = ${surveyId}
      ;
      `;

    const response = await this.connection.sql<IPermitModel>(sqlStatement);

    return response.rows;
  }

  /**
   * Fetch permit records by user.
   *
   * @param
   * @return {*}  {Promise<IPermitModel>}
   * @memberof PermitRepository
   */
  async getPermitByUser(systemUserId: number): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
    SELECT
      p.*
    FROM
      permit p
      , survey s
      , project p2
      , project_participation pp
      , project_role pr
    WHERE
      p.survey_id = s.survey_id
    AND
      s.project_id = p2.project_id
    AND
      p2.project_id = pp.project_id
    AND
      pr."name" in ('${PROJECT_ROLE.COORDINATOR}', '${PROJECT_ROLE.COLLABORATOR}')
    AND
      pp.project_role_id = pr.project_role_id
    AND
      pp.system_user_id = ${systemUserId};
      `;

    const response = await this.connection.sql<IPermitModel>(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get permit by user Id', [
        'PermitRepository->getPermitByUser',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Fetch all permit records.
   *
   * @param
   * @return {*}  {Promise<IPermitModel>}
   * @memberof PermitRepository
   */
  async getAllPermits(): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
      SELECT
        p.*
      FROM
        permit p;
    `;

    const response = await this.connection.sql<IPermitModel>(sqlStatement);

    return response.rows;
  }

  /**
   * Update survey permit.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  number
   * @memberof PermitRepository
   */
  async updateSurveyPermit(
    surveyId: number,
    permitId: number,
    permitNumber: string,
    permitType: string
  ): Promise<number> {
    const sqlStatement = SQL`
      UPDATE permit
      SET
        "number" = ${permitNumber}
        , type = ${permitType}
      WHERE
        permit_id = ${permitId}
      AND
        survey_id = ${surveyId}
      RETURNING permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get update Survey Permit', [
        'PermitRepository->updateSurveyPermit',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.permit_id;
  }

  /**
   * Create survey permit.
   *
   * @param {number} surveyId
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  number
   * @memberof PermitRepository
   */
  async createSurveyPermit(surveyId: number, permitNumber: string, permitType: string): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO
        permit (survey_id, "number", type)
      VALUES
        (${surveyId}, ${permitNumber}, ${permitType})
      RETURNING permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get Create Survey Permit', [
        'PermitRepository->createSurveyPermit',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.permit_id;
  }

  /**
   * Delete survey permit.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @return {*}  number
   * @memberof PermitRepository
   */
  async deleteSurveyPermit(surveyId: number, permitId: number): Promise<number> {
    const sqlStatement = SQL`
      DELETE FROM
        permit
      WHERE
        permit_id = ${permitId}
      AND
        survey_id =  ${surveyId}
      RETURNING permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get Delete Survey Permit', [
        'PermitRepository->deleteSurveyPermit',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result.permit_id;
  }
}
