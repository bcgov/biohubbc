import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  GetProjectData
} from '../models/project-view';
import { ProjectRepository } from '../repositories/project-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectService } from './project-service';

chai.use(sinonChai);

describe('ProjectService', () => {
  describe('ensureProjectParticipant', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('does not add a new project participant if one already exists', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon
        .stub(ProjectService.prototype, 'getProjectParticipant')
        .resolves('existing participant');

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).not.to.have.been.called;
    });

    it('adds a new project participant if one did not already exist', async () => {
      const mockDBConnection = getMockDBConnection();

      const getProjectParticipantStub = sinon.stub(ProjectService.prototype, 'getProjectParticipant').resolves(null);

      const addProjectParticipantStub = sinon.stub(ProjectService.prototype, 'addProjectParticipant');

      const projectId = 1;
      const systemUserId = 1;
      const projectParticipantRoleId = 1;

      const projectService = new ProjectService(mockDBConnection);

      try {
        await projectService.ensureProjectParticipant(projectId, systemUserId, projectParticipantRoleId);
      } catch (actualError) {
        expect.fail();
      }

      expect(getProjectParticipantStub).to.have.been.calledOnce;
      expect(addProjectParticipantStub).to.have.been.calledOnce;
    });
  });

  describe('getProjectParticipant', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const data = { id: 1 };

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectParticipant').resolves(data);

      const response = await service.getProjectParticipant(1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('getProjectParticipants', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const data = [{ id: 1 }];

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectParticipants').resolves(data);

      const response = await service.getProjectParticipants(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('addProjectParticipant', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const repoStub = sinon.stub(ProjectRepository.prototype, 'addProjectParticipant').resolves();

      const response = await service.addProjectParticipant(1, 1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });
  });

  describe('getProjectList', () => {
    it('returns rows on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const data = [
        {
          id: 123,
          name: 'Project 1',
          start_date: '1900-01-01',
          end_date: '2200-10-10',
          coordinator_agency: 'Agency 1',
          project_type: 'Aquatic Habitat'
        },
        {
          id: 456,
          name: 'Project 2',
          start_date: '1900-01-01',
          end_date: '2000-12-31',
          coordinator_agency: 'Agency 2',
          project_type: 'Terrestrial Habitat'
        }
      ];

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectList').resolves(data);

      const response = await service.getProjectList(true, 1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response[0].id).to.equal(123);
      expect(response[0].name).to.equal('Project 1');
      expect(response[0].completion_status).to.equal('Active');

      expect(response[1].id).to.equal(456);
      expect(response[1].name).to.equal('Project 2');
      expect(response[1].completion_status).to.equal('Completed');
    });
  });
});

describe('getProjectData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetProjectData({ id: 1 });

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectData').resolves(data);

    const response = await service.getProjectData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getObjectivesData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetObjectivesData({ id: 1 });

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getObjectivesData').resolves(data);

    const response = await service.getObjectivesData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getCoordinatorData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetCoordinatorData({ id: 1 });

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getCoordinatorData').resolves(data);

    const response = await service.getCoordinatorData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getLocationData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetLocationData({ id: 1 });

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getLocationData').resolves(data);

    const response = await service.getLocationData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getIUCNClassificationData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetIUCNClassificationData([{ id: 1 }]);

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getIUCNClassificationData').resolves(data);

    const response = await service.getIUCNClassificationData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getFundingData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetFundingData([{ id: 1 }]);

    const repoStub = sinon.stub(ProjectRepository.prototype, 'getFundingData').resolves(data);

    const response = await service.getFundingData(1);

    expect(repoStub).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});

describe('getPartnershipsData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = new GetPartnershipsData([{ id: 1 }], [{ id: 1 }]);

    const repoStub1 = sinon.stub(ProjectRepository.prototype, 'getIndigenousPartnershipsRows').resolves([{ id: 1 }]);
    const repoStub2 = sinon.stub(ProjectRepository.prototype, 'getStakeholderPartnershipsRows').resolves([{ id: 1 }]);

    const response = await service.getPartnershipsData(1);

    expect(repoStub1).to.be.calledOnce;
    expect(repoStub2).to.be.calledOnce;
    expect(response).to.eql(data);
  });
});
