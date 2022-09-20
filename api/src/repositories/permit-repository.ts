import SQL from 'sql-template-strings';
import { SYSTEM_ROLE } from '../constants/roles';
import { BaseRepository } from './base-repository';

export interface IPermitModel {
  permit_id: number;
  permit_number: string;
  permit_type: string;
  coordinator_first_name: string | null;
  coordinator_last_name: string | null;
  coordinator_email_address: string | null;
  coordinator_agency_name: string | null;
  issue_date: string | null;
  end_date: string | null;
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
   * Fetch a permit record by primary id.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<IPermitModel>}
   * @memberof PermitRepository
   */
  async getPermitBySurveyId(surveyId: number): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
      with user_roles as (select true from system_user su, system_role sr, system_user_role sur 
        where sur.system_user_id = su.system_user_id 
        and sur.system_role_id = sr.system_role_id 
        and su.system_user_id = biohub.api_get_context_user_id()
        and sr.name in (${SYSTEM_ROLE.SYSTEM_ADMIN},${SYSTEM_ROLE.DATA_ADMINISTRATOR})
        group by su.user_identifier)
      , user_permits as (select p.* from permit p, survey s, survey_permit sp, project_participation pp 
        where pp.system_user_id = biohub.api_get_context_user_id()
        and s.project_id = pp.project_id 
        and sp.survey_id = s.survey_id 
        and p.permit_id = sp.permit_id
        and s.survey_id = ${surveyId}
        )
      select p.* from permit p
      where exists (select from user_roles) 
      or p.permit_id in (select p.permit_id from user_permits)
      ;
      `;

    const response = await this.connection.sql<IPermitModel>(sqlStatement);

    return response.rows;
  }

  async getPermitByUser(): Promise<IPermitModel[]> {
    const sqlStatement = SQL`
      with user_roles as (select true from system_user su, system_role sr, system_user_role sur 
        where sur.system_user_id = su.system_user_id 
        and sur.system_role_id = sr.system_role_id 
        and su.system_user_id = biohub.api_get_context_user_id()
        and sr.name in (${SYSTEM_ROLE.SYSTEM_ADMIN},${SYSTEM_ROLE.DATA_ADMINISTRATOR})
        group by su.user_identifier)
      , user_permits as (select p.* from permit p, survey s, survey_permit sp, project_participation pp 
        where pp.system_user_id = biohub.api_get_context_user_id()
        and s.project_id = pp.project_id 
        and sp.survey_id = s.survey_id 
        and p.permit_id = sp.permit_id
        )
      select p.* from permit p
      where exists (select from user_roles) 
      or p.permit_id in (select p.permit_id from user_permits)
      ;
      `;

    const response = await this.connection.sql<IPermitModel>(sqlStatement);

    return response.rows;
  }
}
