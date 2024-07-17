import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinonChai from 'sinon-chai';
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
  describe('findProjects', () => {
    it('should return a list of projects', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [1],
        keyword: 'string'
      };

      const response = await repository.findProjects(false, 1, input);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return a list of projects using different filter fields', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        project_name: 'string',
        agency_project_id: 1,
        agency_id: 1,
        species: [1],
        keyword: 'string'
      };

      const response = await repository.findProjects(true, 1, input);

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return result with both data fields', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        keyword: 'a'
      };

      const response = await repository.findProjects(true, 1, input);

      expect(response).to.eql([]);
    });
  });

  describe('findProjectsCount', () => {
    it('should return a project count', async () => {
      const mockResponse = { rows: [{ count: 69 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.findProjectsCount(false, 1001, {});

      expect(response).to.eql(69);
    });

    it('should throw an error', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      try {
        await repository.findProjectsCount(true, 1001, {});
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to get project count');
      }
    });
  });

  describe('getProjectData', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ project_id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getProjectData(1);

      expect(response).to.eql({ project_id: 1 });
    });

    it('should throw an error', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
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
      const mockResponse = { rows: [{ objectives: 'obj' }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getObjectivesData(1);

      expect(response).to.eql(new GetObjectivesData({ objectives: 'obj' }));
    });

    it('should throw an error', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
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
      const mockResponse = {
        rows: [{ iucn_conservation_action_level_1_classification_id: 1 }],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIUCNClassificationData(1);

      expect(response).to.eql(
        new GetIUCNClassificationData([{ iucn_conservation_action_level_1_classification_id: 1 }])
      );
    });

    it('should return empty rows', async () => {
      const mockResponse = { rows: [], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getIUCNClassificationData(1);

      expect(response).to.eql(new GetIUCNClassificationData([]));
    });
  });

  describe('getAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.eql(new GetAttachmentsData([{ id: 1 }]));
    });

    it('should return empty rows', async () => {
      const mockResponse = { rows: [], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getAttachmentsData(1);

      expect(response).to.not.be.null;
      expect(response).to.eql(new GetAttachmentsData([]));
    });
  });

  describe('getReportAttachmentsData', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([{ id: 1 }]));
    });

    it('should return null', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.getReportAttachmentsData(1);

      expect(response).to.eql(new GetReportAttachmentsData([]));
    });
  });

  describe('insertProject', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        project: {
          name: 'name',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.eql(1);
    });

    it('should return result when no geometry given', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        project: {
          name: 'name',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown as PostProjectObject;

      const response = await repository.insertProject(input);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const input = {
        project: {
          name: 'name',
          comments: 'comments'
        },
        objectives: { objectives: '' }
      } as unknown as PostProjectObject;

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
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.insertClassificationDetail(1, 1);

      expect(response).to.eql(1);
    });

    it('should throw an error', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
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
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteIUCNData(1);

      expect(response).to.eql(undefined);
    });
  });

  describe('deleteProject', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new ProjectRepository(dbConnection);

      const response = await repository.deleteProject(1);

      expect(response).to.eql(undefined);
    });
  });
});
