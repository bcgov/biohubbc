import { IDBConnection } from '../database/db';
import { ProjectUser } from '../models/user';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { DBService } from './db-service';

export class ProjectParticipationService extends DBService {
  projectParticipationRepository: ProjectParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.projectParticipationRepository = new ProjectParticipationRepository(connection);
  }

  async deleteProjectParticipationRecord(projectParticipationId: number): Promise<any> {
    return this.projectParticipationRepository.deleteProjectParticipationRecord(projectParticipationId);
  }

  async getProjectParticipant(projectId: number, systemUserId: number): Promise<ProjectUser | null> {
    return this.projectParticipationRepository.getProjectParticipant(projectId, systemUserId);
  }

  async getProjectParticipants(projectId: number): Promise<object[]> {
    return this.projectParticipationRepository.getProjectParticipants(projectId);
  }

  async addProjectParticipant(
    projectId: number,
    systemUserId: number,
    projectParticipantRoleId: number
  ): Promise<void> {
    return this.projectParticipationRepository.addProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
  }

  async insertParticipantRole(projectId: number, projectParticipantRole: string): Promise<void> {
    return this.projectParticipationRepository.insertParticipantRole(projectId, projectParticipantRole);
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
}
