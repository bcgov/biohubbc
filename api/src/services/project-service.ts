import { HTTP400 } from '../errors/custom-error';
import { queries } from '../queries/queries';
import { DBService } from './service';

export type ListSystemUsers = {
  id: number;
  user_identifier: string;
  record_end_date: string;
  role_ids: number[];
  role_names: string[];
};

export class ProjectService extends DBService {
  /**
   * Gets the project participant, adding them if they do not already exist.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async ensureProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const projectParticipantRecord = await this.getProjectParticipant(projectId, systemUserId);

    if (projectParticipantRecord) {
      // project participant already exists, do nothing
      return;
    }

    // add new project participant record
    await this.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Get an existing project participant.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {Promise<any>}
   * @memberof ProjectService
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<any> {
    const sqlStatement = queries.projectParticipation.getProjectParticipationBySystemUserSQL(projectId, systemUserId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to get project team members');
    }

    return response?.rows?.[0] || null;
  }

  /**
   * Get all project participants for a project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    const sqlStatement = queries.projectParticipation.getAllProjectParticipantsSQL(projectId);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL select statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project team members');
    }

    return (response && response.rows) || [];
  }

  /**
   * Adds a new project participant.
   *
   * Note: Will fail if the project participant already exists.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectService
   */
  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    const sqlStatement = queries.projectParticipation.addProjectRoleByRoleIdSQL(
      projectId,
      systemUserId,
      projectParticipantRoleId
    );

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL insert statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert project team member');
    }
  }
}
