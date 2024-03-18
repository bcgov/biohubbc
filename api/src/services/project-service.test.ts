import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { GetIUCNClassificationData, GetObjectivesData, ProjectData, ProjectListData } from '../models/project-view';
import { ProjectRepository } from '../repositories/project-repository';
import { getMockDBConnection } from '../__mocks__/db';
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

      const data: ProjectListData[] = [
        {
          project_id: 123,
          name: 'Project 1',
          project_programs: [],
          regions: [],
          start_date: '1900-01-01',
          end_date: '2200-10-10'
        },
        {
          project_id: 456,
          name: 'Project 2',
          project_programs: [],
          regions: [],
          start_date: '1900-01-01',
          end_date: '2000-12-31'
        }
      ];

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectList').resolves(data);

      const response = await service.getProjectList(true, 1, {});

      expect(repoStub).to.be.calledOnce;
      expect(response[0].project_id).to.equal(123);
      expect(response[0].name).to.equal('Project 1');
      expect(response[0].completion_status).to.equal('Active');

      expect(response[1].project_id).to.equal(456);
      expect(response[1].name).to.equal('Project 2');
      expect(response[1].completion_status).to.equal('Completed');
    });
  });

  describe('getProjectCount', () => {
    it('returns the total project count', async () => {
      const dbConnection = getMockDBConnection();
      const service = new ProjectService(dbConnection);

      const repoStub = sinon.stub(ProjectRepository.prototype, 'getProjectCount').resolves(69);

      const response = await service.getProjectCount({}, false, 1001);

      expect(repoStub).to.be.calledOnce;
      expect(response).to.eql(69);
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
});
