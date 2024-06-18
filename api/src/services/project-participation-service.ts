import { PROJECT_PERMISSION, PROJECT_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { PostParticipantData } from '../models/project-create';
import {
  IParticipant,
  ProjectParticipationRecord,
  ProjectParticipationRepository,
  ProjectUser,
  UserProjectParticipation
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
   * @param {number} projectId
   * @param {number} projectParticipationId
   * @return {*}  {Promise<ProjectParticipationRecord>}
   * @memberof ProjectParticipationService
   */
  async deleteProjectParticipationRecord(
    projectId: number,
    projectParticipationId: number
  ): Promise<ProjectParticipationRecord> {
    return this.projectParticipationRepository.deleteProjectParticipationRecord(projectId, projectParticipationId);
  }

  /**
   * Get the project participant for the given project id and system user.
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
   * Get the project participant for the given project and user guid.
   *
   * @param {number} projectId
   * @param {number} userGuid
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipantByProjectIdAndUserGuid(
    projectId: number,
    userGuid: string
  ): Promise<(ProjectUser & SystemUser) | null> {
    return this.projectParticipationRepository.getProjectParticipantByProjectIdAndUserGuid(projectId, userGuid);
  }

  /**
   * Get the project participant for the given survey id and user guid.
   *
   * @param {number} surveyId
   * @param {number} userGuid
   * @return {*}  {(Promise<(ProjectUser & SystemUser) | null>)}
   * @memberof ProjectParticipationService
   */
  async getProjectParticipantBySurveyIdAndUserGuid(
    surveyId: number,
    userGuid: string
  ): Promise<(ProjectUser & SystemUser) | null> {
    return this.projectParticipationRepository.getProjectParticipantBySurveyIdAndUserGuid(surveyId, userGuid);
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
   * @return {*}  {Promise<UserProjectParticipation[]>}
   * @memberof ProjectParticipationService
   */
  async getProjectsBySystemUserId(systemUserId: number): Promise<UserProjectParticipation[]> {
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

  /**
   * Internal function for validating that all Project members have a role
   *
   * @param participants
   * @param roleToCheck
   * @returns boolean
   */
  doProjectParticipantsHaveARole(participants: PostParticipantData[], roleToCheck: PROJECT_ROLE): boolean {
    return participants.some((item) => item.project_role_names.some((role) => role === roleToCheck));
  }

  /**
   * Internal function for validating that all Project members have one role in the incoming payload
   * @param participants
   * @returns boolean
   */
  doProjectParticipantsHaveOneRole(participants: PostParticipantData[]): boolean {
    // Use reduce to count occurrences of each participant
    const participantCounts = participants.reduce((acc, participant) => {
      const id = participant.system_user_id;
      const existingParticipant = acc.find((item) => item.system_user_id === id);

      if (existingParticipant) {
        // If participant already exists, increment count if it has one role or more than one role (to indicate multiple roles)
        existingParticipant.count += participant.project_role_names.length;
      } else {
        // If participant does not exist, add it with initial count based on its role count
        acc.push({ system_user_id: id, count: participant.project_role_names.length });
      }

      return acc;
    }, [] as { system_user_id: number; count: number }[]);

    return participantCounts.filter((participant) => participant.count > 1).length < 1;
  }

  /**
   * Updates existing participants, deletes those not in the incoming list,
   * and inserts new participants
   *
   * @param projectId
   * @param participants
   * @throws ApiGeneralError If no participant has a coordinator role or if any participant has multiple roles.
   */
  async upsertProjectParticipantData(projectId: number, participants: PostParticipantData[]): Promise<void> {
    // Confirm that at least one participant has a coordinator role
    if (!this.doProjectParticipantsHaveARole(participants, PROJECT_ROLE.COORDINATOR)) {
      throw new ApiGeneralError(
        `Projects require that at least one participant has a ${PROJECT_ROLE.COORDINATOR} role.`
      );
    }

    // Check for multiple roles for any participant
    if (!this.doProjectParticipantsHaveOneRole(participants)) {
      throw new ApiGeneralError(
        'Users can only have one role per Project but multiple roles were specified for at least one user.'
      );
    }

    // Fetch existing participants for the project
    const existingParticipants = await this.projectParticipationRepository.getProjectParticipants(projectId);

    // Prepare promises for all database operations
    const promises: Promise<any>[] = [];

    // Identify participants to delete
    const participantsToDelete = existingParticipants.filter(
      (existing) => !participants.some((incoming) => incoming.system_user_id === existing.system_user_id)
    );

    // Delete participants not present in the incoming payload
    participantsToDelete.forEach((participant) => {
      promises.push(
        this.projectParticipationRepository.deleteProjectParticipationRecord(
          projectId,
          participant.project_participation_id
        )
      );
    });

    // Upsert participants based on conditions
    participants.forEach((item) => {
      const existingParticipant = existingParticipants.find(
        (existing) => existing.system_user_id === item.system_user_id
      );

      if (existingParticipant) {
        // Update existing participant's role
        if (
          !existingParticipant.project_role_names.some((role) => item.project_role_names.includes(role as PROJECT_ROLE))
        ) {
          const existingProjectParticipantId = existingParticipant.project_participation_id;
          promises.push(
            this.projectParticipationRepository.updateProjectParticipationRole(
              item.project_participation_id ?? existingProjectParticipantId,
              item.project_role_names[0]
            )
          );
        }
      } else if (!existingParticipant) {
        // Insert new participant if the system_user_id does not exist
        promises.push(
          this.projectParticipationRepository.postProjectParticipant(
            projectId,
            item.system_user_id,
            item.project_role_names[0]
          )
        );
      }
      // If the participant already exists with the desired role, do nothing
    });

    await Promise.all(promises);
  }
}
