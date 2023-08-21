import { PROJECT_PERMISSION, PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTP400 } from '../errors/http-error';
import { ProjectUser } from '../models/user';
import {
  IInsertProjectParticipant,
  IParticipant,
  ProjectParticipationRepository
} from '../repositories/project-participation-repository';
import { DBService } from './db-service';
import { UserService } from './user-service';

export class ProjectParticipationService extends DBService {
  userService: UserService;
  projectParticipationRepository: ProjectParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.userService = new UserService(connection);
    this.projectParticipationRepository = new ProjectParticipationRepository(connection);
  }

  /**
   * Gets the project participant, adding them if they do not already exist.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationService
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
   * Adds a project participant to the project.
   *
   * @param {number} projectId
   * @param {(IParticipant & { userGuid: string | null })} participant
   * @memberof ProjectParticipationService
   */
  async ensureSystemUserAndProjectParticipantUser(
    projectId: number,
    participant: IParticipant & { userGuid: string | null }
  ) {
    // Create or activate the system user
    const systemUserObject = await this.userService.ensureSystemUser(
      participant.userGuid,
      participant.userIdentifier,
      participant.identitySource,
      participant.displayName,
      participant.email
    );

    // Add project role, unless they already have one
    await this.ensureProjectParticipant(projectId, systemUserObject.system_user_id, participant.roleId);
  }

  /**
   * Adds a project participants to the project.
   *
   * @param {number} projectId
   * @param {IInsertProjectParticipant[]} participants
   * @memberof ProjectParticipationService
   */
  async insertProjectUsers(projectId: number, participants: IInsertProjectParticipant[]) {
    for (const participant of participants) {
      await this.insertProjectParticipantRole(projectId, participant.system_user_id, participant.role);
    }
  }

  /**
   * Deletes a project participation record.
   *
   * @param {number} projectParticipationId
   * @return {*}  {Promise<any>}
   * @memberof ProjectParticipationService
   */
  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<any> {
    return this.projectParticipationRepository.deleteProjectParticipationRecord(projectParticipationId);
  }

  /**
   * Get the project participant for the given project and system user.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {(Promise<ProjectUser | null>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<ProjectUser | null> {
    return this.projectParticipationRepository.getProjectParticipant(projectId, systemUserId);
  }

  /**
   * Gets the project participants for the given project.
   *
   * @param {number} projectId
   * @return {*}  {Promise<object[]>}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipants(projectId: number): Promise<object[]> {
    return this.projectParticipationRepository.getProjectParticipants(projectId);
  }

  /**
   * Adds a project participant to the project.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {number} projectParticipantRoleId
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationService
   */
  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    return this.projectParticipationRepository.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  /**
   * Adds current logged in user as a participant to a given project
   *
   * @param {number} projectId
   * @param {string} projectParticipantRole
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationService
   */
  async insertParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    const currentUserId = this.connection.systemUserId();
    if (!currentUserId) {
      throw new ApiExecuteSQLError('Failed to identify system user ID');
    }
    return this.insertProjectParticipantRole(projectId, currentUserId, projectParticipantRole);
  }

  /**
   * Adds a project participant to the project.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {string} projectParticipantRole
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationService
   */
  async insertProjectParticipantRole(
    projectId: number,
    systemUserId: number,
    projectParticipantRole: string
  ): Promise<void> {
    return this.projectParticipationRepository.insertProjectParticipantRole(
      projectId,
      systemUserId,
      projectParticipantRole
    );
  }

  /**
   * Fetches the project participants for all projects that the given system user is a member of.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<any[]>}
   * @memberof projectParticipationRepository
   */
  async getParticipantsFromAllProjectsBySystemUserId(systemUserId: number): Promise<any[]> {
    return this.projectParticipationRepository.getParticipantsFromAllProjectsBySystemUserId(systemUserId);
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
   * @memberof UserService
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
    return this.projectParticipationRepository.getProjectsBySystemUserId(systemUserId);
  }

  /**
   * Checks if the given user is the only coordinator for any project. If so, throw an error.
   *
   * @param {number} userId
   * @param {IDBConnection} connection
   * @return {*}
   * @memberof ProjectParticipationService
   */
  async checkIfUserIsOnlyProjectLeadOnAnyProject(userId: number, connection: IDBConnection) {
    const projectParticipationService = new ProjectParticipationService(connection);

    const getAllParticipantsResponse = await projectParticipationService.getParticipantsFromAllProjectsBySystemUserId(
      userId
    );

    // No projects associated to user, skip coordinator role check
    if (!getAllParticipantsResponse.length) {
      return;
    }

    const onlyProjectLeadResponse = this.doAllProjectsHaveAProjectLeadIfUserIsRemoved(
      getAllParticipantsResponse,
      userId
    );

    if (!onlyProjectLeadResponse) {
      throw new HTTP400(`Cannot remove user. User is the only ${PROJECT_ROLE.COORDINATOR} for one or more projects.`);
    }
  }

  /**
   * Given an array of project participation role objects, return false if any project has no Coordinator role. Return
   * true otherwise.
   *
   * @param {any[]} rows
   * @return {*}  {boolean}
   */
  doAllProjectsHaveAProjectLead(rows: any[]): boolean {
    // No project with Coordinator
    if (!rows.length) {
      return false;
    }

    const projectLeadsPerProject: { [key: string]: any } = {};

    // count how many coordinator roles there are per project
    rows.forEach((row) => {
      const key = row.project_id;

      if (!projectLeadsPerProject[key]) {
        projectLeadsPerProject[key] = 0;
      }

      if (row.project_role_name === PROJECT_PERMISSION.COORDINATOR) {
        projectLeadsPerProject[key] += 1;
      }
    });

    const projectLeadCounts = Object.values(projectLeadsPerProject);

    // check if any projects would be left with no Coordinator
    for (const count of projectLeadCounts) {
      if (!count) {
        // found a project with no Coordinator
        return false;
      }
    }

    // all projects have a Coordinator
    return true;
  }

  /**
   * Given an array of project participation role objects, return true if any project has no Coordinator role after
   * removing all rows associated with the provided `userId`. Return false otherwise.
   *
   * @param {any[]} rows
   * @param {number} userId
   * @return {*}  {boolean}
   */
  doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows: any[], userId: number): boolean {
    // No project with coordinator
    if (!rows.length) {
      return false;
    }

    const projectLeadsPerProject: { [key: string]: any } = {};

    // count how many Coordinator roles there are per project
    rows.forEach((row) => {
      const key = row.project_id;

      if (!projectLeadsPerProject[key]) {
        projectLeadsPerProject[key] = 0;
      }

      if (row.system_user_id !== userId && row.project_role_name === PROJECT_PERMISSION.COORDINATOR) {
        projectLeadsPerProject[key] += 1;
      }
    });

    const projectLeadCounts = Object.values(projectLeadsPerProject);

    // check if any projects would be left with no Coordinator
    for (const count of projectLeadCounts) {
      if (!count) {
        // found a project with no Coordinator
        return false;
      }
    }

    // all projects have a Coordinator
    return true;
  }
}
