import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiError, ApiExecuteSQLError } from '../errors/api-error';
import { PostFundingSource, PostProjectObject } from '../models/project-create';
import { PutFundingSource } from '../models/project-update';
import {
  GetAttachmentsData,
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetReportAttachmentsData
} from '../models/project-view';
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

  describe('getProjectList', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        coordinator_agency: 'string',
        start_date: 'start',
        end_date: null,
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [{ id: 1 }],
        keyword: 'string'
      };

      const response = await repository.getProjectList(false, 1, input);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return result with different filter fields', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        coordinator_agency: 'string',
        start_date: null,
        end_date: 'end',
        project_type: 'string',
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [{ id: 1 }],
        keyword: 'string'
      };

      const response = await repository.getProjectList(true, 1, input);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return result with both data fields', async () => {
      const mockResponse = ({ rows: null, rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        start_date: 'start',
        end_date: 'end'
      };

      const response = await repository.getProjectList(true, 1, input);

      expect(response).to.not.be.null;
      expect(response).to.eql([]);
    });
  });

  describe('getProjectData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ project_id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getProjectData(1);

      expect(response).to.not.be.null;

      expect(response).to.eql({ project_id: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getProjectData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project data');
      }
    });
  });

  describe('getObjectivesData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ objectives: 'obj' }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getObjectivesData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetObjectivesData({ objectives: 'obj' }));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getObjectivesData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project objectives data');
      }
    });
  });

  describe('getCoordinatorData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ coordinator_first_name: 'name' }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getCoordinatorData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetCoordinatorData({ coordinator_first_name: 'name' }));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getCoordinatorData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project contact data');
      }
    });
  });

  describe('getLocationData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ location_description: 'desc' }], rowCount: 1 } as any) as Promise<
        QueryResult<any>
      >;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getLocationData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetLocationData([{ location_description: 'desc' }]));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getLocationData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project location data');
      }
    });
  });

  describe('getIUCNClassificationData', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [{ iucn_conservation_action_level_1_classification_id: 1 }],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIUCNClassificationData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(
        new GetIUCNClassificationData([{ iucn_conservation_action_level_1_classification_id: 1 }])
      );
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getIUCNClassificationData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project IUCN Classification data');
      }
    });
  });

  describe('getFundingData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getFundingData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetFundingData([{ id: 1 }]));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getFundingData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project funding data');
      }
    });
  });

  describe('getIndigenousPartnershipsRows', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIndigenousPartnershipsRows(1);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ id: 1 }]);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getIndigenousPartnershipsRows(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project Indigenous Partnerships data');
      }
    });
  });

  describe('getStakeholderPartnershipsRows', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ partnership_name: 'name' }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getStakeholderPartnershipsRows(1);

      expect(response).to.not.be.null;
      expect(response).to.eql([{ partnership_name: 'name' }]);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getStakeholderPartnershipsRows(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project Stakeholder Partnerships data');
      }
    });
  });

  describe('getAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetAttachmentsData([{ id: 1 }]));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getAttachmentsData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project Attachment data');
      }
    });
  });

  describe('getReportAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetReportAttachmentsData([{ id: 1 }]));
    });

    it('should return null', async () => {
      const mockResponse = ({ rows: [], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetReportAttachmentsData([]));
    });
  });

  describe('insertProject', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          type: 1,
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '', caveats: '' },
        location: { location_description: '', geometry: [{ id: 1 }] },
        coordinator: {
          first_name: 'first_name',
          last_name: 'last_name',
          email_address: 'email_address',
          coordinator_agency: 'coordinator_agency',
          share_contact_details: 'share_contact_details'
        }
      } as unknown) as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should return result when no geometry given', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          type: 1,
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '', caveats: '' },
        location: { location_description: '', geometry: [] },
        coordinator: {
          first_name: 'first_name',
          last_name: 'last_name',
          email_address: 'email_address',
          coordinator_agency: 'coordinator_agency',
          share_contact_details: 'share_contact_details'
        }
      } as unknown) as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          type: 1,
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '', caveats: '' },
        location: { location_description: '', geometry: [] },
        coordinator: {
          first_name: 'first_name',
          last_name: 'last_name',
          email_address: 'email_address',
          coordinator_agency: 'coordinator_agency',
          share_contact_details: 'share_contact_details'
        }
      } as unknown) as PostProjectObject;

      try {
        await repository.insertProject(input);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project boundary data');
      }
    });
  });

  describe('insertFundingSource', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        investment_action_category: 1,
        agency_project_id: 1,
        funding_amount: 123,
        start_date: 'start',
        end_date: 'end'
      } as unknown) as PostFundingSource;

      const response = await repository.insertFundingSource(input, 1);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        investment_action_category: 1,
        agency_project_id: 1,
        funding_amount: 123,
        start_date: 'start',
        end_date: 'end'
      } as unknown) as PostFundingSource;

      try {
        await repository.insertFundingSource(input, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project funding data');
      }
    });
  });

  describe('insertIndigenousNation', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertIndigenousNation(1, 1);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: null, rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertIndigenousNation(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project first nations partnership data');
      }
    });
  });

  describe('insertStakeholderPartnership', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertStakeholderPartnership('partner', 1);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertStakeholderPartnership('partner', 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project stakeholder partnership data');
      }
    });
  });

  describe('insertClassificationDetail', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertClassificationDetail(1, 1);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertClassificationDetail(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project IUCN data');
      }
    });
  });

  describe('insertActivity', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertActivity(1, 1);

      expect(response).to.not.be.null;
      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertActivity(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project activity data');
      }
    });
  });

  describe('deleteIUCNData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteIUCNData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteIndigenousPartnershipsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteIndigenousPartnershipsData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteStakeholderPartnershipsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteStakeholderPartnershipsData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteActivityData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ query: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteActivityData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteProject', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteProject(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('insertProgram', () => {
    it('should return early', async () => {
      const dbConnection = getMockDBConnection();
      const mockSql = sinon.stub(dbConnection, 'sql').resolves();
      const repository = new ProjectRepository(dbConnection);

      await repository.insertProgram(1, []);

      expect(mockSql).to.not.be.called;
    });

    it('should run properly', async () => {
      const dbConnection = getMockDBConnection();
      const mockSql = sinon.stub(dbConnection, 'sql').resolves();
      const repository = new ProjectRepository(dbConnection);

      await repository.insertProgram(1, [1]);

      expect(mockSql).to.be.called;
    });

    it('should throw an SQL error', async () => {
      const dbConnection = getMockDBConnection();
      sinon.stub(dbConnection, 'sql').rejects();
      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertProgram(1, [1]);
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to execute insert SQL for project_program');
      }
    });
  });

  describe('deletePrograms', () => {
    it('should run without issue', async () => {
      const dbConnection = getMockDBConnection();
      const mockSql = sinon.stub(dbConnection, 'sql').resolves();
      const repository = new ProjectRepository(dbConnection);

      await repository.deletePrograms(1);

      expect(mockSql).to.be.called;
    });

    it('should throw an SQL error', async () => {
      const dbConnection = getMockDBConnection();
      sinon.stub(dbConnection, 'sql').rejects();
      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.deletePrograms(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.equal('Failed to execute delete SQL for project_program');
      }
    });
  });
});
