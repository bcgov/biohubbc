import SQL from 'sql-template-strings';
import { z } from 'zod';
import { SURVEY_ROLE } from '../constants/roles';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { SystemUserWithRoles } from '../models/system-user-view';
import { BaseRepository } from './base-repository';

export const SurveyMember = z.object({
  survey_member_id: z.number(),
  survey_id: z.number(),
  system_user_id: z.number(),
  survey_role_id: z.number(),
  survey_role_name: z.string()
});

export type SurveyMember = z.infer<typeof SurveyMember>;

export interface IMember {
  systemUserId: number;
  userIdentifier: string;
  identitySource: string;
  roleId: number;
  displayName: string;
  email: string;
}

export const SurveyMemberRecord = z.object({
  survey_member_id: z.number(),
  survey_id: z.number(),
  system_user_id: z.number(),
  survey_role_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyMemberRecord = z.infer<typeof SurveyMemberRecord>;

export interface IInsertSurveyMember {
  system_user_id: number;
  role: SURVEY_ROLE;
}

export const UserSurveyMember = z.object({
  survey_name: z.string(),
  survey_member_id: z.number(),
  system_user_id: z.number(),
  survey_role_id: z.array(z.number()),
  survey_role_name: z.array(z.string())
});

export type UserSurveyMember = z.infer<typeof UserSurveyMember>;

/**
 * A repository class for accessing survey participants data.
 *
 * @export
 * @class SurveyMemberRepository
 * @extends {BaseRepository}
 */
export class SurveyMemberRepository extends BaseRepository {
  /**
   * Deletes a survey member record.
   *
   * @param {number} surveyId
   * @param {number} surveyParticipationId
   * @return {*}  {Promise<SurveyMemberRecord>}
   * @memberof SurveyMemberRepository
   */
  async deleteSurveyMemberRecord(surveyId: number, surveyParticipationId: number): Promise<SurveyMemberRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_member
      WHERE
        survey_member_id = ${surveyParticipationId}
      AND
        survey_id = ${surveyId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyMemberRecord);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey member record', [
        'SurveyRepository->deleteSurveyMemberRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async updateSurveyMemberRole(surveyParticipationId: number, role: string): Promise<void> {
    const sql = SQL`
      UPDATE survey_member 
      SET survey_role_id = (
        SELECT survey_role_id 
        FROM survey_role 
        WHERE name = ${role} 
        AND record_end_date IS NULL
      ) 
      WHERE survey_member_id = ${surveyParticipationId};
    `;
    await this.connection.sql(sql);
  }

  /**
   * Get a survey user by survey and system user id. Returns null if the system user is not a participant of the
   * survey.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles) | null>)}
   * @memberof SurveyMemberRepository
   */
  async getSurveyMember(surveyId: number, systemUserId: number): Promise<(SurveyMember & SystemUserWithRoles) | null> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pp.survey_id,
        pr.survey_role_id,
        pr.name as survey_role_name
      FROM
        survey_member pp
      LEFT JOIN survey_role pr
        ON pp.survey_role_id = pr.survey_role_id
      LEFT JOIN "system_user" su
        ON pp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        pp.survey_id = ${surveyId}
      AND
        pp.system_user_id = ${systemUserId}
      AND
        su.record_end_date is NULL
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pp.survey_id,
        pr.survey_role_id,
        pr.name,
        pp.create_date
      ORDER BY
        pp.create_date DESC;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyMember.merge(SystemUserWithRoles));

    return response.rows?.[0] || null;
  }

  /**
   * Get a survey user by survey id and system user guid. Returns null if the system user is not a member of the
   * survey.
   *
   * @param {number} surveyId
   * @param {string} userGuid
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles) | null>)}
   * @memberof SurveyMemberRepository
   */
  async getSurveyMemberBySurveyIdAndUserGuid(
    surveyId: number,
    userGuid: string
  ): Promise<(SurveyMember & SystemUserWithRoles) | null> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder
      .select(
        knex.raw(`
          su.system_user_id,
          su.user_identifier,
          su.user_guid,
          su.record_end_date,
          uis.name AS identity_source,
          array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
          array_remove(array_agg(sr.name), NULL) AS role_names,
          su.email,
          su.display_name,
          su.given_name,
          su.family_name,
          su.agency,
          pp.survey_member_id,
          pp.survey_id,
          pr.survey_role_id,
          pr.name as survey_role_name
        `)
      )
      .from('survey_member as pp')
      .leftJoin('survey_role as pr', 'pp.survey_role_id', 'pr.survey_role_id')
      .leftJoin('system_user as su', 'pp.system_user_id', 'su.system_user_id')
      .leftJoin('system_user_role as sur', 'su.system_user_id', 'sur.system_user_id')
      .leftJoin('system_role as sr', 'sur.system_role_id', 'sr.system_role_id')
      .leftJoin('user_identity_source as uis', 'uis.user_identity_source_id', 'su.user_identity_source_id')
      .where('su.record_end_date', null)
      .where('pp.survey_id', surveyId)
      .where(knex.raw(`LOWER(su.user_guid) = LOWER('${userGuid}')`))
      .groupBy('su.system_user_id')
      .groupBy('su.record_end_date')
      .groupBy('su.user_identifier')
      .groupBy('su.user_guid')
      .groupBy('uis.name')
      .groupBy('su.email')
      .groupBy('su.display_name')
      .groupBy('su.given_name')
      .groupBy('su.family_name')
      .groupBy('su.agency')
      .groupBy('pp.survey_member_id')
      .groupBy('pp.survey_id')
      .groupBy('pp.survey_role_id')
      .groupBy('pp.name')
      .groupBy('pp.create_date')
      .orderBy('pp.create_date', 'desc');

    const response = await this.connection.knex(queryBuilder, SurveyMember.merge(SystemUserWithRoles));

    return response.rows?.[0] || null;
  }

  /**
   * Gets a list of survey participants for a given survey.
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles)[]>)}
   * @memberof SurveyMemberRepository
   */
  async getSurveyMembers(surveyId: number): Promise<(SurveyMember & SystemUserWithRoles)[]> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pp.survey_id,
        pr.survey_role_id,
        pr.name as survey_role_name
      FROM
        survey_member pp
      LEFT JOIN survey_role pr
        ON pp.survey_role_id = pr.survey_role_id
      LEFT JOIN "system_user" su
        ON pp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        pp.survey_id = ${surveyId}
      AND
        su.record_end_date is NULL
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pp.survey_id,
        pr.survey_role_id,
        pr.name,
        pp.create_date
      ORDER BY
        pp.create_date DESC;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyMember.merge(SystemUserWithRoles));

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to get survey team members', [
        'SurveyRepository->getSurveyMembers',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Adds a survey participant to the database.
   *
   * @param {number} surveyId
   * @param {number} systemUserId The system ID of the user.
   * @param {(number | string)} surveyMemberRole The ID or Name of the role to assign.
   * @return {*}  {Promise<void>}
   * @memberof SurveyMemberRepository
   */
  async insertSurveyMember(surveyId: number, systemUserId: number, surveyMemberRole: number | string): Promise<void> {
    let sqlStatement;

    // If surveyMemberRole is a string (role name), look up the ID in the insert (case-insensitive)
    if (isNaN(Number(surveyMemberRole))) {
      sqlStatement = SQL`
        INSERT INTO survey_member (
          survey_id,
          system_user_id,
          survey_role_id
        )
        SELECT
          ${surveyId},
          ${systemUserId},
          survey_role_id
        FROM
          survey_role
        WHERE
          LOWER(name) = LOWER(${surveyMemberRole})
          AND record_end_date IS NULL
        RETURNING *;
      `;
    } else {
      sqlStatement = SQL`
        INSERT INTO survey_member (
          survey_id,
          system_user_id,
          survey_role_id
        ) VALUES (
          ${surveyId},
          ${systemUserId},
          ${surveyMemberRole}
        )
        RETURNING *;
      `;
    }

    const response = await this.connection.sql(sqlStatement);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey team member', [
        'SurveyRepository->postSurveyMember',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Fetches the survey participants for all surveys that the given system user is a member of.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles)[]>)}
   * @memberof SurveyMemberRepository
   */
  async getMembersFromAllSurveysBySystemUserId(systemUserId: number): Promise<(SurveyMember & SystemUserWithRoles)[]> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pp.survey_id,
        pr.survey_role_id,
        pr.name as survey_role_name
      FROM
        survey_member pp
      LEFT JOIN survey_role pr
        ON pp.survey_role_id = pr.survey_role_id
      LEFT JOIN "system_user" su
        ON pp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        pp.system_user_id = ${systemUserId}
      AND
        su.record_end_date is NULL
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        pp.survey_member_id,
        pr.survey_role_id,
        pr.name,
        pp.survey_id,
        pp.create_date
      ORDER BY
        pp.create_date DESC;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyMember.merge(SystemUserWithRoles));

    return response.rows;
  }

  /**
   * Fetches all surveys for the given system user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<UserSurveyMember[]>}
   * @memberof SurveyMemberRepository
   */
  async getSurveysBySystemUserId(systemUserId: number): Promise<UserSurveyMember[]> {
    const sqlStatement = SQL`
      SELECT
        p.survey_id,
        p.name as survey_name,
        pp.survey_member_id,
        pp.system_user_id,
        pr.survey_role_id,
        pr.name as survey_role_name
      FROM
        survey_member pp
      LEFT JOIN 
        survey_role pr
        ON pp.survey_role_id = pr.survey_role_id
      
      LEFT JOIN
        survey p
        ON pp.survey_id = p.survey_id
      WHERE
        pp.system_user_id = ${systemUserId}
    `;

    const response = await this.connection.sql(sqlStatement, UserSurveyMember);

    return response.rows;
  }
}
