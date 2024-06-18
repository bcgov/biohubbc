import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../constants/roles';
import { ApiGeneralError } from '../errors/api-error';
import { PostParticipantData } from '../models/project-create';
import { ProjectParticipationRepository, ProjectUser } from '../repositories/project-participation-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationService } from './project-participation-service';
import { UserService } from './user-service';

chai.use(sinonChai);

describe('ProjectParticipationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('ensureProjectParticipant', () => {
    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
        .resolves({
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        });

      const addProjectParticipantStub = sinon.stub(ProjectParticipationService.prototype, 'postProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectParticipationService = new ProjectParticipationService(mockDBConnection);

      try {
        await projectParticipationService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
        .resolves(null);

      const addProjectParticipantStub = sinon.stub(ProjectParticipationService.prototype, 'postProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectParticipationService = new ProjectParticipationService(mockDBConnection);

      try {
        await projectParticipationService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('ensureSystemUserAndProjectParticipantUser', () => {
    it('ensures the system user exists and adds a project participation record ', async () => {
      const mockDBConnection = getMockDBConnection();
      const projectParticipationService = new ProjectParticipationService(mockDBConnection);

      const ensureSystemUserStub = sinon.stub(UserService.prototype, 'ensureSystemUser').resolves({
        system_user_id: 11,
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_identifier: 'testuser',
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname'
      });
      const ensureProjectParticipantStub = sinon
        .stub(ProjectParticipationService.prototype, 'ensureProjectParticipant')
        .resolves();

      const projectId = 1;
      const participant = {
        systemUserId: 11,
        userIdentifier: 'testuser',
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        roleId: 1,
        displayName: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        userGuid: '123-456-789'
      };

      await projectParticipationService.ensureSystemUserAndProjectParticipantUser(projectId, participant);

      expect(ensureSystemUserStub).to.have.been.calledOnceWith(
        participant.userGuid,
        participant.userIdentifier,
        participant.identitySource,
        participant.displayName,
        participant.email
      );
      expect(ensureProjectParticipantStub).to.have.been.calledOnceWith(projectId, 11, 1);
    });
  });

  describe('postProjectParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const projectId = 1;
      const participants: PostParticipantData[] = [
        {
          system_user_id: 11,
          project_participation_id: 12,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        },
        {
          system_user_id: 22,
          project_participation_id: 23,
          project_role_names: [PROJECT_ROLE.OBSERVER]
        },
        {
          system_user_id: 33,
          project_participation_id: 34,
          project_role_names: [PROJECT_ROLE.COLLABORATOR, PROJECT_ROLE.OBSERVER]
        }
      ];

      const postProjectParticipantStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'postProjectParticipant')
        .resolves();

      await service.postProjectParticipants(projectId, participants);

      expect(postProjectParticipantStub).to.be.calledWith(
        projectId,
        participants[0].system_user_id,
        participants[0].project_role_names[0]
      );
      expect(postProjectParticipantStub).to.be.calledWith(
        projectId,
        participants[1].system_user_id,
        participants[1].project_role_names[0]
      );
      expect(postProjectParticipantStub).to.be.calledWith(
        projectId,
        participants[2].system_user_id,
        participants[2].project_role_names[0]
      );
    });
  });

  describe('deleteProjectParticipationRecord', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const mockSurveyId = 1;
      const data = {
        projectParticipationId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord')
        .resolves();

      const response = await service.deleteProjectParticipationRecord(mockSurveyId, data.projectParticipationId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('getProjectParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1,
        systemUserId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipant').resolves({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      });

      const response = await service.getProjectParticipant(data.projectId, data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({
        project_participation_id: 1,
        project_id: 1,
        system_user_id: 2,
        project_role_ids: [1],
        project_role_names: ['Role1'],
        project_role_permissions: ['Permission1'],
        agency: null,
        display_name: 'test user',
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Role1'],
        user_guid: '123-456-789',
        user_identifier: 'testuser'
      });
    });
  });

  describe('getProjectParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants').resolves([
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        }
      ]);

      const response = await service.getProjectParticipants(data.projectId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        }
      ]);
    });
  });

  describe('getProjectParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants').resolves([
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        }
      ]);

      const response = await service.getProjectParticipants(data.projectId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        }
      ]);
    });
  });

  describe('postProjectParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1,
        systemUserId: 1,
        projectParticipantRoleId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'postProjectParticipant').resolves();

      const response = await service.postProjectParticipant(
        data.projectId,
        data.systemUserId,
        data.projectParticipantRoleId
      );

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('postProjectParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1,
        systemUserId: 1,
        projectParticipantRoleId: 'role'
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'postProjectParticipant').resolves();

      const response = await service.postProjectParticipant(
        data.projectId,
        data.systemUserId,
        data.projectParticipantRoleId
      );

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('getParticipantsFromAllProjectsBySystemUserId', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        systemUserId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getParticipantsFromAllProjectsBySystemUserId')
        .resolves([
          {
            project_id: 1,
            system_user_id: 2,
            project_participation_id: 1,
            project_role_ids: [1],
            project_role_names: ['Role1'],
            project_role_permissions: ['Permission1'],
            agency: null,
            display_name: 'test user',
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            record_end_date: null,
            role_ids: [1],
            role_names: ['Role1'],
            user_guid: '123-456-789',
            user_identifier: 'testuser'
          }
        ]);

      const response = await service.getParticipantsFromAllProjectsBySystemUserId(data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          project_id: 1,
          system_user_id: 2,
          project_participation_id: 1,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          agency: null,
          display_name: 'test user',
          email: 'email@email.com',
          family_name: 'lname',
          given_name: 'fname',
          identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
          record_end_date: null,
          role_ids: [1],
          role_names: ['Role1'],
          user_guid: '123-456-789',
          user_identifier: 'testuser'
        }
      ]);
    });
  });

  describe('getProjectsBySystemUserId', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        systemUserId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectsBySystemUserId').resolves([
        {
          project_id: 1,
          system_user_id: 2,
          project_participation_id: 1,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          project_name: 'project name'
        }
      ]);

      const response = await service.getProjectsBySystemUserId(data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([
        {
          project_id: 1,
          system_user_id: 2,
          project_participation_id: 1,
          project_role_ids: [1],
          project_role_names: ['Role1'],
          project_role_permissions: ['Permission1'],
          project_name: 'project name'
        }
      ]);
    });
  });

  describe('doAllProjectsHaveAProjectLead', () => {
    it('should return false if no user has Coordinator role', () => {
      const projectUsers: ProjectUser[] = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(projectUsers);

      expect(result).to.equal(false);
    });

    it('should return true if one Coordinator role exists per project', () => {
      const projectUsers: ProjectUser[] = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 12,
          project_role_ids: [1],
          project_role_names: ['Coordinator'], // Only Coordinator on project 1
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(projectUsers);

      expect(result).to.equal(true);
    });

    it('should return true if one Coordinator exists on all projects', () => {
      const projectUsers: ProjectUser[] = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_ids: [1],
          project_role_names: ['Coordinator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 2,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 1,
          project_id: 2,
          system_user_id: 10,
          project_role_ids: [1],
          project_role_names: ['Coordinator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 2,
          system_user_id: 2,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(projectUsers);

      expect(result).to.equal(true);
    });

    it('should return false if no Coordinator exists on any one project', () => {
      const projectUsers: ProjectUser[] = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_ids: [1],
          project_role_names: ['Coordinator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 1,
          project_id: 2,
          system_user_id: 10,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        },
        {
          project_participation_id: 2,
          project_id: 2,
          system_user_id: 20,
          project_role_ids: [2],
          project_role_names: ['Collaborator'],
          project_role_permissions: ['Permission1']
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(projectUsers);

      expect(result).to.equal(false);
    });
  });

  describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
    describe('user has Coordinator role', () => {
      describe('user is on 1 project', () => {
        it('should return false if the user is not the only Coordinator role', () => {
          const userId = 10;

          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(true);
        });

        it('should return true if the user is the only Coordinator role', () => {
          const userId = 10;

          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Coordinator'], // Only Coordinator on project 1
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_ids: [2],
              project_role_names: ['Collaborator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(false);
        });
      });

      describe('user is on multiple projects', () => {
        it('should return true if the user is not the only Coordinator on all projects', () => {
          const userId = 10;

          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(true);
        });

        it('should return false if the user the only Coordinator on any project', () => {
          const userId = 10;

          // User is on 1 project, and is not the only Coordinator
          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Collaborator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Coordinator'], // Only Coordinator on project 2
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Collaborator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(false);
        });
      });
    });

    describe('user does not have Coordinator role', () => {
      describe('user is on 1 project', () => {
        it('should return true', () => {
          const userId = 10;

          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Collaborator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(true);
        });
      });

      describe('user is on multiple projects', () => {
        it('should return true', () => {
          const userId = 10;

          const projectUsers: ProjectUser[] = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Collaborator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_ids: [1],
              project_role_names: ['Observer'],
              project_role_permissions: ['Permission1']
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_ids: [1],
              project_role_names: ['Coordinator'],
              project_role_permissions: ['Permission1']
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

          expect(result).to.equal(true);
        });
      });
    });

    describe('user is on no projects', () => {
      it('should return false', () => {
        const userId = 10;

        const projectUsers: ProjectUser[] = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: 20,
            project_role_ids: [1],
            project_role_names: ['Collaborator'],
            project_role_permissions: ['Permission1']
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 30,
            project_role_ids: [1],
            project_role_names: ['Coordinator'],
            project_role_permissions: ['Permission1']
          }
        ];

        const dbConnection = getMockDBConnection();
        const service = new ProjectParticipationService(dbConnection);

        const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(projectUsers, userId);

        expect(result).to.equal(true);
      });
    });
  });

  describe('doProjectParticipantsHaveARole', () => {
    it('should return true if one project user has a specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: []
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveARole(projectUsers, PROJECT_ROLE.COLLABORATOR);

      expect(result).to.be.true;
    });

    it('should return true if multiple project users have a specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveARole(projectUsers, PROJECT_ROLE.COLLABORATOR);

      expect(result).to.be.true;
    });

    it('should return false if no project users have a specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: []
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.OBSERVER]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveARole(projectUsers, PROJECT_ROLE.COLLABORATOR);

      expect(result).to.be.false;
    });
  });

  describe('doProjectParticipantsHaveOneRole', () => {
    it('should return true if one project user has one specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveOneRole(projectUsers);

      expect(result).to.be.true;
    });

    it('should return true if multiple project users have one specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.OBSERVER]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveOneRole(projectUsers);

      expect(result).to.be.true;
    });

    it('should return false if a participant has multiple specified role', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.OBSERVER]
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveOneRole(projectUsers);

      expect(result).to.be.false;
    });

    it('should return false if a participant has multiple specified roles in the same record', () => {
      const projectUsers: PostParticipantData[] = [
        {
          project_participation_id: 12,
          system_user_id: 11,
          project_role_names: [PROJECT_ROLE.COORDINATOR]
        },
        {
          project_participation_id: 23,
          system_user_id: 22,
          project_role_names: [PROJECT_ROLE.OBSERVER, PROJECT_ROLE.COLLABORATOR]
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doProjectParticipantsHaveOneRole(projectUsers);

      expect(result).to.be.false;
    });
  });

  describe('upsertProjectParticipantData', () => {
    it('throws an error if at least one user does not have the coordinator role', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const projectId = 1;
      const participants: PostParticipantData[] = [
        {
          system_user_id: 11,
          project_participation_id: 12,
          project_role_names: [PROJECT_ROLE.COLLABORATOR]
        },
        {
          system_user_id: 22,
          project_participation_id: 23,
          project_role_names: [PROJECT_ROLE.OBSERVER]
        },
        {
          system_user_id: 33,
          project_participation_id: 34,
          project_role_names: [PROJECT_ROLE.COLLABORATOR, PROJECT_ROLE.OBSERVER]
        }
      ];

      try {
        await service.upsertProjectParticipantData(projectId, participants);

        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal(
          `Projects require that at least one participant has a ${PROJECT_ROLE.COORDINATOR} role.`
        );
      }
    });

    it('removes, updates, and inserts project participants', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const projectId = 1;
      const participants: PostParticipantData[] = [
        {
          system_user_id: 11,
          project_participation_id: 12,
          project_role_names: [PROJECT_ROLE.COORDINATOR] // Existing user to be updated
        },
        {
          system_user_id: 33,
          project_role_names: [PROJECT_ROLE.COLLABORATOR] // Existing user to be unaffected
        },
        {
          system_user_id: 44,
          project_role_names: [PROJECT_ROLE.OBSERVER] // New user
        }
      ];

      const getProjectParticipantsStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getProjectParticipants')
        .resolves([
          {
            project_participation_id: 12, // Existing user to be updated
            project_id: 1,
            system_user_id: 11,
            project_role_ids: [1],
            project_role_names: [PROJECT_ROLE.COLLABORATOR],
            project_role_permissions: ['Permission1'],
            agency: null,
            display_name: 'test user 1',
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            record_end_date: null,
            role_ids: [2],
            role_names: [SYSTEM_ROLE.PROJECT_CREATOR],
            user_guid: '123-456-789-1',
            user_identifier: 'testuser1'
          },
          {
            project_participation_id: 6, // Existing user to be unaffected
            project_id: 1,
            system_user_id: 33,
            project_role_ids: [2],
            project_role_names: [PROJECT_ROLE.COLLABORATOR],
            project_role_permissions: ['Permission1'],
            agency: null,
            display_name: 'test user 1',
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            record_end_date: null,
            role_ids: [2],
            role_names: [SYSTEM_ROLE.PROJECT_CREATOR],
            user_guid: '123-456-789-1',
            user_identifier: 'testuser1'
          },
          {
            project_participation_id: 23, // Existing user to be removed
            project_id: 1,
            system_user_id: 22,
            project_role_ids: [1],
            project_role_names: [PROJECT_ROLE.COORDINATOR],
            project_role_permissions: ['Permission1'],
            agency: null,
            display_name: 'test user 2',
            email: 'email@email.com',
            family_name: 'lname',
            given_name: 'fname',
            identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
            record_end_date: null,
            role_ids: [2],
            role_names: [],
            user_guid: '123-456-789-2',
            user_identifier: 'testuser2'
          }
        ]);
      const deleteProjectParticipationRecordStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord')
        .resolves();
      const updateProjectParticipationRoleStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'updateProjectParticipationRole')
        .resolves();
      const postProjectParticipantStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'postProjectParticipant')
        .resolves();

      await service.upsertProjectParticipantData(projectId, participants);

      expect(getProjectParticipantsStub).to.have.been.calledOnceWith(projectId);
      expect(deleteProjectParticipationRecordStub).to.have.been.calledWith(1, 23);
      expect(updateProjectParticipationRoleStub).to.have.been.calledOnceWith(12, PROJECT_ROLE.COORDINATOR);
      expect(updateProjectParticipationRoleStub).to.not.have.been.calledWith(6, PROJECT_ROLE.COLLABORATOR);
      expect(postProjectParticipantStub).to.not.have.been.calledWith(projectId, 6, PROJECT_ROLE.COLLABORATOR);
      expect(postProjectParticipantStub).to.have.been.calledOnceWith(projectId, 44, PROJECT_ROLE.OBSERVER);
    });
  });
});
