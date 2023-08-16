import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ProjectUser } from '../models/user';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectParticipationService } from './project-participation-service';

chai.use(sinonChai);

describe('ProjectParticipationService', () => {
  afterEach(() => {
    sinon.restore();
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

  describe('addProjectParticipant', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1,
        systemUserId: 1,
        projectParticipantRoleId: 1
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'addProjectParticipant').resolves();

      const response = await service.addProjectParticipant(
        data.projectId,
        data.systemUserId,
        data.projectParticipantRoleId
      );

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('insertParticipantRole', () => {
    it('succeeds with valid data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectParticipationService(dbConnection);

      const data = {
        projectId: 1,
        projectParticipantRoleId: 'role'
      };

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'insertParticipantRole').resolves();

      const response = await service.insertParticipantRole(data.projectId, data.projectParticipantRoleId);

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
});
