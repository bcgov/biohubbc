import SQL from 'sql-template-strings';
import { SCHEMAS } from '../constants/database';
import { SYSTEM_ROLE } from '../constants/roles';
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
      select p.* from permit p
      where p.survey_id = ${surveyId}
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
  async getPermitByUser(): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
      with user_roles as (select true from system_user su, system_role sr, system_user_role sur
        where sur.system_user_id = su.system_user_id
        and sur.system_role_id = sr.system_role_id
        and su.system_user_id = `;
    sqlStatement
      .append(SCHEMAS.DATA)
      .append(
        `.api_get_context_user_id()
        and sr.name in ('${SYSTEM_ROLE.SYSTEM_ADMIN}','${SYSTEM_ROLE.DATA_ADMINISTRATOR}')
        group by su.user_identifier)
      , user_permits as (select p.* from permit p, survey s, project_participation pp
        where pp.system_user_id = `
      )
      .append(SCHEMAS.DATA).append(`.api_get_context_user_id()
        and s.project_id = pp.project_id
        and p.survey_id = s.survey_id
        )
      select p.* from permit p
      where exists (select from user_roles)
      or p.permit_id in (select p.permit_id from user_permits)
      ;
      `);

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
      update permit
        set "number" = ${permitNumber}
        , type = ${permitType}
      where permit_id = ${permitId}
        and survey_id = ${surveyId}
      returning permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

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
      insert into permit (survey_id, "number", type) values (${surveyId}, ${permitNumber}, ${permitType})
      returning permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

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
      delete from permit
      where permit_id = ${permitId}
      and survey_id =  ${surveyId}
      returning permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    return result.permit_id;
  }
}
