import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError } from '../errors/api-error';
import { PutFundingSource } from '../models/project-update';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectRepository } from './project-repository';

chai.use(sinonChai);

describe('ProjectRepository', () => {
  describe('getProjectFundingSourceIds', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return an array of project funding source ids', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ project_funding_source_id: 2 }]
      } as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      const response = await permitRepository.getProjectFundingSourceIds(1);

      expect(response).to.eql([{ project_funding_source_id: 2 }]);
    });

    it('should throw an error if no funding were found', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      try {
        await permitRepository.getProjectFundingSourceIds(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to get project funding sources by Id');
      }
    });
  });

  describe('deleteSurveyFundingSourceConnectionToProject', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete survey funding source connected to project returning survey_id', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ survey_id: 2 }]
      } as unknown) as QueryResult<{
        survey_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      const response = await permitRepository.deleteSurveyFundingSourceConnectionToProject(1);

      expect(response).to.eql([{ survey_id: 2 }]);
    });

    it('should throw an error if delete failed', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      try {
        await permitRepository.deleteSurveyFundingSourceConnectionToProject(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete survey funding source by id');
      }
    });
  });

  describe('deleteProjectFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should delete project funding source', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ survey_id: 2 }]
      } as unknown) as QueryResult<{
        survey_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      const response = await permitRepository.deleteProjectFundingSource(1);

      expect(response).to.eql([{ survey_id: 2 }]);
    });

    it('should throw an error delete failed', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<{
        survey_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      try {
        await permitRepository.deleteProjectFundingSource(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to delete project funding source');
      }
    });
  });

  describe('updateProjectFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should update project funding source', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ project_funding_source_id: 2 }]
      } as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const data = new PutFundingSource({
        id: 1,
        investment_action_category: 1,
        agency_project_id: 'string',
        funding_amount: 1,
        start_date: 'string',
        end_date: 'string',
        revision_count: '1'
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      const response = await permitRepository.updateProjectFundingSource(data, 1);

      expect(response).to.eql({ project_funding_source_id: 2 });
    });

    it('should throw an error update failed', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const data = new PutFundingSource({
        id: 1,
        investment_action_category: 1,
        agency_project_id: 'string',
        funding_amount: 1,
        start_date: 'string',
        end_date: 'string',
        revision_count: '1'
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      try {
        await permitRepository.updateProjectFundingSource(data, 1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to update project funding source');
      }
    });
  });

  describe('insertProjectFundingSource', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should insert project funding source', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [{ project_funding_source_id: 2 }]
      } as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const data = new PutFundingSource({
        id: 1,
        investment_action_category: 1,
        agency_project_id: 'string',
        funding_amount: 1,
        start_date: 'string',
        end_date: 'string',
        revision_count: '1'
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      const response = await permitRepository.insertProjectFundingSource(data, 1);

      expect(response).to.eql({ project_funding_source_id: 2 });
    });

    it('should throw an error insert failed', async () => {
      const mockQueryResponse = ({} as unknown) as QueryResult<{
        project_funding_source_id: number;
      }>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const data = new PutFundingSource({
        id: 1,
        investment_action_category: 1,
        agency_project_id: 'string',
        funding_amount: 1,
        start_date: 'string',
        end_date: 'string',
        revision_count: '1'
      });

      const permitRepository = new ProjectRepository(mockDBConnection);

      try {
        await permitRepository.insertProjectFundingSource(data, 1);
        expect.fail();
      } catch (error) {
        expect((error as ApiError).message).to.equal('Failed to insert project funding source');
      }
    });
  });
});
