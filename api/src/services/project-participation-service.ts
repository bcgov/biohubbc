import { PROJECT_PERMISSION, PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { PostParticipantData } from '../models/project-create';
import {
  IParticipant,
  ProjectParticipationRecord,
  ProjectParticipationRepository,
  ProjectUser
} from '../repositories/project-participation-repository';
import { SystemUser } from '../repositories/user-repository';
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
    await this.postProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
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
   * Adds multiple project participants to the project.
   *
   * @param {number} projectId
   * @param {IInsertProjectParticipant[]} participants
   * @return {*}  {Promise<void[]>}
   * @memberof ProjectParticipationService
   */
  async postProjectParticipants(projectId: number, participants: PostParticipantData[]): Promise<void[]> {
    return Promise.all(
      participants.map((participant) =>
        this.postProjectParticipant(projectId, participant.system_user_id, participant.project_role_names[0])
      )
    );
  }

  /**
   * Deletes a project participation record.
   *
   * @param {number} projectParticipationId
   * @return {*}  {Promise<ProjectParticipationRecord>}
   * @memberof ProjectParticipationService
   */
  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<ProjectParticipationRecord> {
    return this.projectParticipationRepository.deleteProjectParticipationRecord(projectParticipationId);
  }

  /**
   * Get the project participant for the given project and system user.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipant(projectId: number, systemUserId: number): Promise<(ProjectUser & SystemUser) | null> {
    return this.projectParticipationRepository.getProjectParticipant(projectId, systemUserId);
  }

  /**
   * Gets the project participants for the given project.
   *
   * @param {number} projectId
   * @return {*}  {(Promise<(ProjectUser & SystemUser)[]>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipants(projectId: number): Promise<(ProjectUser & SystemUser)[]> {
    return this.projectParticipationRepository.getProjectParticipants(projectId);
  }

  /**
   * Adds a project participant to the project.
   *
   * @param {number} projectId
   * @param {number} systemUserId
   * @param {(number | string)} projectParticipantRole
   * @return {*}  {Promise<void>}
   * @memberof ProjectParticipationService
   */
  async postProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRole: number | string
  ): Promise<void> {
    return this.projectParticipationRepository.postProjectParticipant(projectId, systemUserId, projectParticipantRole);
  }

  /**
   * Fetches the project participants for all projects that the given system user is a member of.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<(ProjectUser & SystemUser)[]>)}
   * @memberof projectParticipationRepository
   */
  async getParticipantsFromAllProjectsBySystemUserId(systemUserId: number): Promise<(ProjectUser & SystemUser)[]> {
    return this.projectParticipationRepository.getParticipantsFromAllProjectsBySystemUserId(systemUserId);
  }

  /**
   * Fetches all projects for the given system user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<
   *     {
   *       project_participation_id: number;
   *       project_id: number;
   *       project_name: string;
   *       system_user_id: number;
   *       project_role_ids: number[];
   *       project_role_names: string[];
   *       project_role_permissions: string[];
   *     }[]
   *   >}
   * @memberof ProjectParticipationService
   */
  async getProjectsBySystemUserId(
    systemUserId: number
  ): Promise<
    {
      project_participation_id: number;
      project_id: number;
      project_name: string;
      system_user_id: number;
      project_role_ids: number[];
      project_role_names: string[];
      project_role_permissions: string[];
    }[]
  > {
    return this.projectParticipationRepository.getProjectsBySystemUserId(systemUserId);
  }

  /**
   * Check if the given user is the only coordinator on at least 1 project.
   *
   * Why? All projects must have at least 1 coordinator. If this user is the only coordinator then deleting them or
   * updating them to not be a coordinator should not be allowed.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<boolean>} `true` if the user is the only project coordinator on at least 1 project, `false`
   * otherwise.
   * @memberof ProjectParticipationService
   */
  async isUserTheOnlyProjectCoordinatorOnAnyProject(systemUserId: number): Promise<boolean> {
    const projectParticipationService = new ProjectParticipationService(this.connection);

    const getAllParticipantsResponse = await projectParticipationService.getParticipantsFromAllProjectsBySystemUserId(
      systemUserId
    );

    if (!getAllParticipantsResponse.length) {
      // User has no projects, and therefore is not the only coordinator on a project
      return false;
    }

    const doAllProjectsHaveACoordinatorIfUserIsRemoved = this.doAllProjectsHaveAProjectLeadIfUserIsRemoved(
      getAllParticipantsResponse,
      systemUserId
    );

    // Negate above response, because `false` indicates the user is the only coordinator, and this function returns
    // `true` in that situation
    return !doAllProjectsHaveACoordinatorIfUserIsRemoved;
  }

  /**
   * Given an array of project participants, return `false` if any project has no Coordinator role. Return `true`
   * otherwise.
   *
   * @param {ProjectUser[]} projectUsers
   * @return {*}  {boolean}
   */
  doAllProjectsHaveAProjectLead(projectUsers: ProjectUser[]): boolean {
    // No project with Coordinator
    if (!projectUsers.length) {
      return false;
    }

    const projectLeadsPerProject: { [key: string]: any } = {};

    // count how many coordinator roles there are per project
    projectUsers.forEach((row) => {
      const key = row.project_id;

      if (!projectLeadsPerProject[key]) {
        projectLeadsPerProject[key] = 0;
      }

      if (row.project_role_names.includes(PROJECT_PERMISSION.COORDINATOR)) {
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
   * @param {ProjectUser[]} projectUsers
   * @param {number} systemUserId
   * @return {*}  {boolean}
   */
  doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers: ProjectUser[], systemUserId: number): boolean {
    // No project with coordinator
    if (!projectUsers.length) {
      return false;
    }

    const projectLeadsPerProject: { [key: string]: any } = {};

    // count how many Coordinator roles there are per project
    projectUsers.forEach((row) => {
      const key = row.project_id;

      if (!projectLeadsPerProject[key]) {
        projectLeadsPerProject[key] = 0;
      }

      if (row.system_user_id !== systemUserId && row.project_role_names.includes(PROJECT_PERMISSION.COORDINATOR)) {
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

  doProjectParticipantsHaveARole(participants: PostParticipantData[], roleToCheck: PROJECT_ROLE): boolean {
    return participants.some((item) => item.project_role_names.some((role) => role === roleToCheck));
  }

  async upsertProjectParticipantData(projectId: number, participants: PostParticipantData[]): Promise<void> {
    if (!this.doProjectParticipantsHaveARole(participants, PROJECT_ROLE.COORDINATOR)) {
      throw new ApiGeneralError(
        `Projects require that at least one participant has a ${PROJECT_ROLE.COORDINATOR} role.`
      );
    }

    // all actions to take
    const promises: Promise<any>[] = [];

    // get the existing participants for a project
    const existingParticipants = await this.projectParticipationRepository.getProjectParticipants(projectId);

    // Compare incoming with existing to find any outliers to delete
    const participantsToDelete = existingParticipants.filter(
      (item) => !participants.find((incoming) => incoming.system_user_id === item.system_user_id)
    );

    // delete
    participantsToDelete.forEach((item) => {
      promises.push(
        this.projectParticipationRepository.deleteProjectParticipationRecord(item.project_participation_id)
      );
    });

    participants.forEach((item) => {
      if (item.project_participation_id) {
        promises.push(
          this.projectParticipationRepository.updateProjectParticipationRole(
            item.project_participation_id,
            item.project_role_names[0]
          )
        );
      } else {
        this.projectParticipationRepository.postProjectParticipant(
          projectId,
          item.system_user_id,
          item.project_role_names[0]
        );
      }
    });

    await Promise.all(promises);
  }
}
