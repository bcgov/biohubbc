import SQL from 'sql-template-strings';
import { SCHEMAS } from '../constants/database';
import { SYSTEM_ROLE } from '../constants/roles';
import { BaseRepository } from './base-repository';

export interface IPermitModel {
  permit_id: number | null;
  permit_number: string;
  permit_type: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number | null;
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
      select p.* from permit p, survey_permit sp 
      where p.permit_id = sp.permit_id 
        and sp.survey_id = ${surveyId}
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
      , user_permits as (select p.* from permit p, survey s, survey_permit sp, project_participation pp 
        where pp.system_user_id = `
      )
      .append(SCHEMAS.DATA).append(`.api_get_context_user_id()
        and s.project_id = pp.project_id 
        and sp.survey_id = s.survey_id 
        and p.permit_id = sp.permit_id
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
   * Associate permit to survey.
   *
   * @param {number} surveyId
   * @param {number} permitId
   * @return {*}  number
   * @memberof PermitRepository
   */
  async upsertPermitToSurvey(surveyId: number, permitId: number): Promise<number> {
    const sqlStatement = SQL`
      insert into survey_permit (survey_id, permit_id) 
        values (${surveyId}, ${permitId}) 
        on conflict do nothing
        returning survey_permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    return result.survey_permit_id;
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
    console.log(`permitNumber2: ${permitNumber}`);
    const sqlStatement = SQL`
      update permit 
        set "number" = ${permitNumber}
        , type = ${permitType}
      where permit_id = ${permitId}
        and exists (select 1 from survey_permit 
          where survey_id = ${surveyId}
          and permit_id = ${permitId})
      returning permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);
    console.log(response);
    const result = (response && response.rows && response.rows[0]) || null;

    return result.permit_id;
  }

  /**
   * Create survey permit.
   *
   * @param {string} permitNumber
   * @param {string} permitType
   * @return {*}  number
   * @memberof PermitRepository
   */
  async createSurveyPermit(permitNumber: string, permitType: string): Promise<number> {
    const sqlStatement = SQL`
      insert into permit ("number", type) values (${permitNumber}, ${permitType})
      returning permit_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    return result.permit_id;
  }

  /**
   * Delete permits not associated with surveys.
   *
   * @param {}
   * @return {*}  number
   * @memberof PermitRepository
   */
  async deleteUnassociatedPermits(): Promise<number> {
    const sqlStatement = SQL`
      delete from permit 
      where permit_id not in (select permit_id from survey_permit);
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    return response.rowCount;
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
      delete from survey_permit 
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
