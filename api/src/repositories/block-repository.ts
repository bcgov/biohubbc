import SQL from 'sql-template-strings';
import { z } from 'zod';
import { PROJECT_ROLE } from '../constants/roles';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import { SystemUser } from './user-repository';

export const ProjectUser = z.object({
  project_participation_id: z.number(),
  project_id: z.number(),
  system_user_id: z.number(),
  project_role_ids: z.array(z.number()),
  project_role_names: z.array(z.string()),
  project_role_permissions: z.array(z.string())
});

export type ProjectUser = z.infer<typeof ProjectUser>;

export const SurveyBlockRecord = z.object({
  survey_block_id: z.number(),
  survey_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SurveyBlockRecord = z.infer<typeof SurveyBlockRecord>;

export interface IParticipant {
  systemUserId: number;
  userIdentifier: string;
  identitySource: string;
  roleId: number;
  displayName: string;
  email: string;
}

export interface IInsertProjectParticipant {
  system_user_id: number;
  role: PROJECT_ROLE;
}

/**
 * A repository class for accessing project participants data.
 *
 * @export
 * @class ProjectParticipationRepository
 * @extends {BaseRepository}
 */
export class ProjectParticipationRepository extends BaseRepository {
  /**
   *  Deletes a project participation record.
   *
   * @param {number} projectParticipationId
   * @return {*}  {Promise<ProjectParticipationRecord>}
   * @memberof ProjectParticipationRepository
   */
  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<ProjectParticipationRecord> {
    const sqlStatement = SQL`
      DELETE FROM
        project_participation
      WHERE
        project_participation_id = ${projectParticipationId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement, ProjectParticipationRecord);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete project participation record', [
        'ProjectRepository->deleteProjectParticipationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async updateProjectParticipationRole(projectParticipationId: number, role: string): Promise<void> {
    const sql = SQL`
      UPDATE project_participation 
      SET project_role_id = (
        SELECT project_role_id 
        FROM project_role 
        WHERE name = ${role} 
        AND record_end_date IS NULL
      ) 
      WHERE project_participation_id = ${projectParticipationId};
    `;
    await this.connection.sql(sql);
  }

  /**
   * Get a project user by project and system user id. Returns null if the system user is not a participant of the
   * project.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   * @memberof ProjectParticipationRepository
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<(ProjectUser & SystemUser) | null> {
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
        su.agency,
        pp.project_participation_id,
        pp.project_id,
        array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
        array_remove(array_agg(pr.name), NULL) AS project_role_names,
        array_remove(array_agg(pp2.name), NULL) as project_role_permissions
      FROM
        project_participation pp
      LEFT JOIN project_role pr
        ON pp.project_role_id = pr.project_role_id
      LEFT JOIN project_role_permission prp
        ON pp.project_role_id = prp.project_role_id
      LEFT JOIN project_permission pp2
        ON pp2.project_permission_id = prp.project_permission_id
      LEFT JOIN system_user su
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
        pp.project_id = ${projectId}
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
        su.agency,
        pp.project_participation_id,
        pp.project_id;
    `;

    const response = await this.connection.sql(sqlStatement, ProjectUser.merge(SystemUser));

    return response.rows?.[0] || null;
  }

  /**
   * Gets a list of project participants for a given project.
   *
   * @param {number} projectId
   * @return {*}  {(Promise<(ProjectUser & SystemUser)[]>)}
   * @memberof ProjectParticipationRepository
   */
  async getProjectParticipants(projectId: number): Promise<(ProjectUser & SystemUser)[]> {
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
        su.agency,
        pp.project_participation_id,
        pp.project_id,
        array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
        array_remove(array_agg(pr.name), NULL) AS project_role_names,
        array_remove(array_agg(pp2.name), NULL) as project_role_permissions
      FROM
        project_participation pp
      LEFT JOIN project_role pr
        ON pp.project_role_id = pr.project_role_id
      LEFT JOIN project_role_permission prp
        ON pp.project_role_id = prp.project_role_id
      LEFT JOIN project_permission pp2
        ON pp2.project_permission_id = prp.project_permission_id
      LEFT JOIN system_user su
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
        pp.project_id = ${projectId}
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
        su.agency,
        pp.project_participation_id,
        pp.project_id;
    `;

    const response = await this.connection.sql(sqlStatement, ProjectUser.merge(SystemUser));

    if (!response.rows.length) {
      throw new ApiExecuteSQLError('Failed to get project team members', [
        'ProjectRepository->getProjectParticipants',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Adds a project participant to the database.
   *
   * @param {number} projectId The ID of the project.
   * @param {number} systemUserId The system ID of the user.
   * @param {(number | string)} projectParticipantRole The ID or Name of the role to assign.
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationRepository
   */
  async postProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRole: number | string
  ): Promise<void> {
    let sqlStatement;

    if (isNaN(Number(projectParticipantRole))) {
      sqlStatement = SQL`
        INSERT INTO project_participation (
          project_id,
          system_user_id,
          project_role_id
        )
        (
          SELECT
            ${projectId},
            ${systemUserId},
            project_role_id
          FROM
            project_role
          WHERE
            name = ${projectParticipantRole}
        );
      `;
    } else {
      sqlStatement = SQL`
        INSERT INTO project_participation (
          project_id,
          system_user_id,
          project_role_id
        ) VALUES (
          ${projectId},
          ${systemUserId},
          ${projectParticipantRole}
        );
      `;
    }

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert project team member', [
        'ProjectRepository->postProjectParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
