import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ProjectParticipationRepository, ProjectUser } from '../repositories/project-participation-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationService } from './project-participation-service';

chai.use(sinonChai);

describe('ProjectParticipationService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectParticipationService.prototype, 'getProjectParticipant')
        .resolves({} as ProjectUser);

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

  describe('deleteProjectParticipationRecord', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectParticipationId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'deleteProjectParticipationRecord')
        .resolves();

      const response = await service.deleteProjectParticipationRecord(data.projectParticipationId);

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

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getProjectParticipant')
        .resolves(({ project_id: 1, system_user_id: 2 } as unknown) as ProjectUser);

      const response = await service.getProjectParticipant(data.projectId, data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ project_id: 1, system_user_id: 2 });
    });
  });

  describe('getProjectParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getProjectParticipants')
        .resolves([{ project_id: 1, system_user_id: 2 } as ProjectUser]);

      const response = await service.getProjectParticipants(data.projectId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{ project_id: 1, system_user_id: 2 }]);
    });
  });

  describe('getProjectParticipants', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getProjectParticipants')
        .resolves([{ project_id: 1, system_user_id: 2 } as ProjectUser]);

      const response = await service.getProjectParticipants(data.projectId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{ project_id: 1, system_user_id: 2 }]);
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
        projectParticipantRoleId: 'role'
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'postProjectParticipant').resolves();

      const response = await service.postProjectParticipant(data.projectId, data.projectParticipantRoleId);

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
        .resolves([{ project_id: 1, system_user_id: 2 } as any]);

      const response = await service.getParticipantsFromAllProjectsBySystemUserId(data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{ project_id: 1, system_user_id: 2 }]);
    });
  });

  describe('getProjectsBySystemUserId', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        systemUserId: 1
      };

      const repoStub = sinon
        .stub(ProjectParticipationRepository.prototype, 'getProjectsBySystemUserId')
        .resolves([{ project_id: 1, system_user_id: 2 } as any]);

      const response = await service.getProjectsBySystemUserId(data.systemUserId);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql([{ project_id: 1, system_user_id: 2 }]);
    });
  });

  describe('doAllProjectsHaveAProjectLeadIfUserIsRemoved', () => {
    describe('user has Coordinator role', () => {
      describe('user is on 1 project', () => {
        it('should return false if the user is not the only Coordinator role', () => {
          const userId = 10;

          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(true);
        });

        it('should return true if the user is the only Coordinator role', () => {
          const userId = 10;

          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Coordinator' // Only Coordinator on project 1
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_id: 2,
              project_role_name: 'Collaborator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(false);
        });
      });

      describe('user is on multiple projects', () => {
        it('should return true if the user is not the only Coordinator on all projects', () => {
          const userId = 10;

          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(true);
        });

        it('should return false if the user the only Coordinator on any project', () => {
          const userId = 10;

          // User is on 1 project, and is not the only Coordinator
          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Collaborator'
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Coordinator' // Only Coordinator on project 2
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Collaborator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(false);
        });
      });
    });

    describe('user does not have Coordinator role', () => {
      describe('user is on 1 project', () => {
        it('should return true', () => {
          const userId = 10;

          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Collaborator'
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 20,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(true);
        });
      });

      describe('user is on multiple projects', () => {
        it('should return true', () => {
          const userId = 10;

          const rows = [
            {
              project_participation_id: 1,
              project_id: 1,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Collaborator'
            },
            {
              project_participation_id: 2,
              project_id: 1,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            },
            {
              project_participation_id: 1,
              project_id: 2,
              system_user_id: userId,
              project_role_id: 1,
              project_role_name: 'Observer'
            },
            {
              project_participation_id: 2,
              project_id: 2,
              system_user_id: 2,
              project_role_id: 1,
              project_role_name: 'Coordinator'
            }
          ];

          const dbConnection = getMockDBConnection();
          const service = new ProjectParticipationService(dbConnection);

          const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

          expect(result).to.equal(true);
        });
      });
    });

    describe('user is on no projects', () => {
      it('should return false', () => {
        const userId = 10;

        const rows = [
          {
            project_participation_id: 1,
            project_id: 1,
            system_user_id: 20,
            project_role_id: 1,
            project_role_name: 'Collaborator'
          },
          {
            project_participation_id: 2,
            project_id: 1,
            system_user_id: 30,
            project_role_id: 1,
            project_role_name: 'Coordinator'
          }
        ];

        const dbConnection = getMockDBConnection();
        const service = new ProjectParticipationService(dbConnection);

        const result = service.doAllProjectsHaveAProjectLeadIfUserIsRemoved(rows, userId);

        expect(result).to.equal(true);
      });
    });
  });

  describe('doAllProjectsHaveAProjectLead', () => {
    it('should return false if no user has Coordinator role', () => {
      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(rows);

      expect(result).to.equal(false);
    });

    it('should return true if one Coordinator role exists per project', () => {
      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 12,
          project_role_id: 1,
          project_role_name: 'Coordinator' // Only Coordinator on project 1
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(rows);

      expect(result).to.equal(true);
    });

    it('should return true if one Coordinator exists on all projects', () => {
      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_id: 1,
          project_role_name: 'Coordinator'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 2,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        },
        {
          project_participation_id: 1,
          project_id: 2,
          system_user_id: 10,
          project_role_id: 1,
          project_role_name: 'Coordinator'
        },
        {
          project_participation_id: 2,
          project_id: 2,
          system_user_id: 2,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(rows);

      expect(result).to.equal(true);
    });

    it('should return false if no Coordinator exists on any one project', () => {
      const rows = [
        {
          project_participation_id: 1,
          project_id: 1,
          system_user_id: 10,
          project_role_id: 1,
          project_role_name: 'Coordinator'
        },
        {
          project_participation_id: 2,
          project_id: 1,
          system_user_id: 20,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        },
        {
          project_participation_id: 1,
          project_id: 2,
          system_user_id: 10,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        },
        {
          project_participation_id: 2,
          project_id: 2,
          system_user_id: 20,
          project_role_id: 2,
          project_role_name: 'Collaborator'
        }
      ];

      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const result = service.doAllProjectsHaveAProjectLead(rows);

      expect(result).to.equal(false);
    });
  });
});
