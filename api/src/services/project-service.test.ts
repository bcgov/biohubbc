import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostProjectObject } from '../models/project-create';
import {
  GetCoordinatorData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetPartnershipsData,
  ProjectData
} from '../models/project-view';
import { ProjectUser } from '../models/user';
import { IUpdateProject } from '../paths/project/{projectId}/update';
import { ProjectParticipationRepository } from '../repositories/project-participation-repository';
import { ProjectRepository } from '../repositories/project-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';
import { PlatformService } from './platform-service';
import { ProjectService } from './project-service';
import { SurveyService } from './survey-service';

chai.use(sinonChai);

describe('ProjectService', () => {
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
        .stub(ProjectService.prototype, 'getProjectParticipant')
        .resolves({} as ProjectUser);

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

      const data = { project_id: 1 } as ProjectUser;

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipant').resolves(data);

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

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'getProjectParticipants').resolves(data);

      const response = await service.getProjectParticipants(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(data);
    });
  });

  describe('addProjectParticipant', () => {
    it('returns the first row on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const repoStub = sinon.stub(ProjectParticipationRepository.prototype, 'addProjectParticipant').resolves();

      const response = await service.addProjectParticipant(1, 1, 1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(undefined);
    });

    describe('createProjectAndUploadMetadataToBioHub', () => {
      it('returns projectId on success', async () => {
        const dbConnection = getMockDBConnection();
        const service = new ProjectService(dbConnection);

        const repoStub1 = sinon.stub(ProjectService.prototype, 'createProject').resolves(1);
        const repoStub2 = sinon.stub(PlatformService.prototype, 'submitProjectDwCMetadataToBioHub').resolves();

        const response = await service.createProjectAndUploadMetadataToBioHub((null as unknown) as PostProjectObject);

        expect(repoStub1).to.be.calledOnce;
        expect(repoStub2).to.be.calledOnce;
        expect(response).to.eql(1);
      });
    });

    describe('updateProjectAndUploadMetadataToBioHub', () => {
      it('successfully updates project', async () => {
        const dbConnection = getMockDBConnection();
        const service = new ProjectService(dbConnection);

        const projectId = 1;
        const projectData = (null as unknown) as IUpdateProject;

        const surveyOneId = 2;
        const surveyTwoId = 3;

        const updateProjectStub = sinon.stub(ProjectService.prototype, 'updateProject').resolves();
        const submitProjectDwCMetadataToBioHubStub = sinon
          .stub(PlatformService.prototype, 'submitProjectDwCMetadataToBioHub')
          .resolves();
        const getSurveyIdsByProjectIdStub = sinon
          .stub(SurveyService.prototype, 'getSurveyIdsByProjectId')
          .resolves([{ id: surveyOneId }, { id: surveyTwoId }]);
        const submitSurveyDwCMetadataToBioHubStub = sinon
          .stub(PlatformService.prototype, 'submitSurveyDwCMetadataToBioHub')
          .resolves();

        const response = await service.updateProjectAndUploadMetadataToBioHub(projectId, projectData);

        expect(updateProjectStub).to.be.calledOnceWith(projectId, projectData);
        expect(submitProjectDwCMetadataToBioHubStub).to.be.calledOnceWith(projectId);
        expect(getSurveyIdsByProjectIdStub).to.be.calledWith(projectId);
        expect(submitSurveyDwCMetadataToBioHubStub).to.be.calledWith(surveyOneId);
        expect(submitSurveyDwCMetadataToBioHubStub).to.be.calledWith(surveyTwoId);
        expect(response).to.eql(undefined);
      });
    });
  });

  describe('getProjectList', () => {
    it('returns rows on success', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const data = [
        {
          project_id: 123,
          uuid: '',
          project_name: 'Project 1',
          coordinator_agency: '',
          project_programs: [],
          project_types: [],
          regions: [],
          start_date: '1900-01-01',
          end_date: '2200-10-10'
        },
        {
          project_id: 456,
          uuid: '',
          project_name: 'Project 2',
          coordinator_agency: '',
          project_programs: [],
          project_types: [],
          regions: [],
          start_date: '1900-01-01',
          end_date: '2000-12-31'
        }
      ];

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectList').resolves(data);

      const response = await service.getProjectList(true, 1, {});

      expect(repoStub).to.be.calledOnce;
      expect(response[0].id).to.equal(123);
      expect(response[0].name).to.equal('Project 1');
      expect(response[0].completion_status).to.equal('Active');

      expect(response[1].id).to.equal(456);
      expect(response[1].name).to.equal('Project 2');
      expect(response[1].completion_status).to.equal('Completed');
    });
  });

  describe('getProjectSupplementaryDataById', () => {
    it('returns project metadata publish data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const mockProjectMetadataPublish = {
        project_metadata_publish_id: 1,
        project_id: 1,
        event_timestamp: '',
        queue_id: 1,
        create_date: '',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1
      };

      const repoStub = sinon
        .stub(HistoryPublishService.prototype, 'getProjectMetadataPublishRecord')
        .resolves(mockProjectMetadataPublish);

      const response = await service.getProjectSupplementaryDataById(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ project_metadata_publish: mockProjectMetadataPublish });
    });

    it('returns null project metadata publish data', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const repoStub = sinon.stub(HistoryPublishService.prototype, 'getProjectMetadataPublishRecord').resolves(null);

      const response = await service.getProjectSupplementaryDataById(1);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql({ project_metadata_publish: null });
    });
  });
});

describe('getProjectData', () => {
  it('returns the first row on success', async () => {
    const dbConnection = getMockDBConnection();
    const service = new ProjectService(dbConnection);

    const data = ({ project_id: 1 } as unknown) as ProjectData;

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
