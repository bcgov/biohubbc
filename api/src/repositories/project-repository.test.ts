import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostProjectObject } from '../models/project-create';
import {
  GetAttachmentsData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetReportAttachmentsData
} from '../models/project-view';
import { getMockDBConnection } from '../__mocks__/db';
import { ProjectRepository } from './project-repository';

chai.use(sinonChai);

describe('ProjectRepository', () => {
  describe('getProjectList', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        start_date: 'start',
        end_date: undefined,
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [1],
        keyword: 'string'
      };

      const response = await repository.getProjectList(false, 1, input);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return result with different filter fields', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        start_date: undefined,
        end_date: 'end',
        project_programs: [1],
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [1],
        keyword: 'string'
      };

      const response = await repository.getProjectList(true, 1, input);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return result with both data fields', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        start_date: 'start',
        end_date: 'end'
      };

      const response = await repository.getProjectList(true, 1, input);

      expect(response).to.eql([]);
    });
  });

  describe('getProjectCount', () => {
    it('should return a project count', async () => {
      const mockResponse = ({ rows: [{ project_count: 69 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getProjectCount(false, 1001);

      expect(response).to.eql(69);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getProjectCount(true, 1001);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project count');
      }
    });
  });

  describe('getProjectData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ project_id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getProjectData(1);

      expect(response).to.eql({ project_id: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
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
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getObjectivesData(1);

      expect(response).to.eql(new GetObjectivesData({ objectives: 'obj' }));
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.getObjectivesData(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project objectives data');
      }
    });
  });

  describe('getIUCNClassificationData', () => {
    it('should return result', async () => {
      const mockResponse = ({
        rows: [{ iucn_conservation_action_level_1_classification_id: 1 }],
        rowCount: 1
      } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIUCNClassificationData(1);

      expect(response).to.eql(
        new GetIUCNClassificationData([{ iucn_conservation_action_level_1_classification_id: 1 }])
      );
    });

    it('should return empty rows', async () => {
      const mockResponse = ({ rows: [], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIUCNClassificationData(1);

      expect(response).to.eql(new GetIUCNClassificationData([]));
    });
  });

  describe('getAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.eql(new GetAttachmentsData([{ id: 1 }]));
    });

    it('should return empty rows', async () => {
      const mockResponse = ({ rows: [], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetAttachmentsData([]));
    });
  });

  describe('getReportAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([{ id: 1 }]));
    });

    it('should return null', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([]));
    });
  });

  describe('insertProject', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          project_programs: [1],
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown) as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.eql(1);
    });

    it('should return result when no geometry given', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          project_programs: [1],
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown) as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = ({
        project: {
          project_programs: [1],
          name: 'name',
          start_date: 'start_date',
          end_date: 'end_date',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown) as PostProjectObject;

      try {
        await repository.insertProject(input);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project boundary data');
      }
    });
  });

  describe('insertClassificationDetail', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertClassificationDetail(1, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = ({ rows: [], rowCount: 0 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.insertClassificationDetail(1, 1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to insert project IUCN data');
      }
    });
  });

  describe('deleteIUCNData', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteIUCNData(1);

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
