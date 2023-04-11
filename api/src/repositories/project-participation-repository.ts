import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing project participants data.
 *
 * @export
 * @class ProjectParticipationRepository
 * @extends {BaseRepository}
 */
export class ProjectParticipationRepository extends BaseRepository {
  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<any> {
    const sqlStatement = SQL`
      DELETE FROM
        project_participation
      WHERE
        project_participation_id = ${projectParticipationId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete project participation record', [
        'ProjectRepository->deleteProjectParticipationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async getProjectParticipant(projectId: number, systemUserId: number): Promise<any> {
    const sqlStatement = SQL`
      SELECT
        pp.project_id,
        pp.system_user_id,
        su.record_end_date,
        array_remove(array_agg(pr.project_role_id), NULL) AS project_role_ids,
        array_remove(array_agg(pr.name), NULL) AS project_role_names
      FROM
        project_participation pp
      LEFT JOIN
        project_role pr
      ON
        pp.project_role_id = pr.project_role_id
      LEFT JOIN
        system_user su
      ON
        pp.system_user_id = su.system_user_id
      WHERE
        pp.project_id = ${projectId}
      AND
        pp.system_user_id = ${systemUserId}
      AND
        su.record_end_date is NULL
      GROUP BY
        pp.project_id,
        pp.system_user_id,
        su.record_end_date ;
      `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    return result;
  }

  async getProjectParticipants(projectId: number): Promise<object[]> {
    const sqlStatement = SQL`
      SELECT
        pp.project_participation_id,
        pp.project_id,
        pp.system_user_id,
        pp.project_role_id,
        pr.name project_role_name,
        su.user_identifier,
        su.user_guid,
        su.user_identity_source_id
      FROM
        project_participation pp
      LEFT JOIN
        system_user su
      ON
        pp.system_user_id = su.system_user_id
      LEFT JOIN
        project_role pr
      ON
        pr.project_role_id = pp.project_role_id
      LEFT JOIN
        project_role pr
      ON
        pr.project_role_id = pp.project_role_id
      WHERE
        pp.project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project team members', [
        'ProjectRepository->getProjectParticipants',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO project_participation (
        project_id,
        system_user_id,
        project_role_id
      ) VALUES (
        ${projectId},
        ${systemUserId},
        ${projectParticipantRoleId}
      )
      RETURNING
        *;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert project team member', [
        'ProjectRepository->getProjectParticipants',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async insertParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new ApiExecuteSQLError('Failed to identify system user ID');
    }

    const sqlStatement = SQL`
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
      )
      RETURNING
        *;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert project team member', [
        'ProjectRepository->insertParticipantRole',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Fetches the project participants for all projects that the given system user is a member of.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<
   *     {
   *       project_id: number;
   *       name: string;
   *       system_user_id: number;
   *       project_role_id: number;
   *       project_participation_id: number;
   *     }[]
   *   >}
   * @memberof UserRepository
   */
  async getParticipantsFromAllProjectsBySystemUserId(
    systemUserId: number
  ): Promise<
    {
      project_id: number;
      name: string;
      system_user_id: number;
      project_role_id: number;
      project_participation_id: number;
    }[]
  > {
    const sqlStatement = SQL`
      SELECT
        pp.project_participation_id,
        pp.project_id,
        pp.system_user_id,
        pp.project_role_id,
        pr.name project_role_name
      FROM
        project_participation pp
      LEFT JOIN
        project p
      ON
        pp.project_id = p.project_id
      LEFT JOIN
        project_role pr
      ON
        pr.project_role_id = pp.project_role_id
      WHERE
        pp.project_id in (
          SELECT
            p.project_id
          FROM
            project_participation pp
          LEFT JOIN
            project p
          ON
            pp.project_id = p.project_id
          WHERE
            pp.system_user_id = ${systemUserId}
        );
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }

  /**
   * Fetches all projects for the given system user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<
   *     {
   *       project_id: number;
   *       name: string;
   *       system_user_id: number;
   *       project_role_id: number;
   *       project_participation_id: number;
   *     }[]
   *   >}
   * @memberof UserRepository
   */
  async getProjectsBySystemUserId(
    systemUserId: number
  ): Promise<
    {
      project_id: number;
      name: string;
      system_user_id: number;
      project_role_id: number;
      project_participation_id: number;
    }[]
  > {
    const sqlStatement = SQL`
      SELECT
        p.project_id,
        p.name,
        pp.system_user_id,
        pp.project_role_id,
        pp.project_participation_id
      FROM
        project_participation pp
      LEFT JOIN
        project p
      ON
        pp.project_id = p.project_id
      WHERE
        pp.system_user_id = ${systemUserId};
    `;

    const response = await this.connection.sql(sqlStatement);

    return response.rows;
  }
}
