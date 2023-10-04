import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { GetIUCNClassificationData, GetLocationData, GetObjectivesData, ProjectData } from '../models/project-view';
import { ProjectRepository } from '../repositories/project-repository';
import { getMockDBConnection } from '../__mocks__/db';
import { HistoryPublishService } from './history-publish-service';
import { ProjectService } from './project-service';

chai.use(sinonChai);

describe('ProjectService', () => {
  afterEach(() => {
    sinon.restore();
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
          project_programs: [],
          regions: [],
          start_date: '1900-01-01',
          end_date: '2200-10-10'
        },
        {
          project_id: 456,
          uuid: '',
          project_name: 'Project 2',
          project_programs: [],
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
