import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import {
  ITechniqueRowDataForInsert,
  ITechniqueRowDataForUpdate,
  TechniqueObject,
  TechniqueRepository
} from './technique-repository';

chai.use(sinonChai);

describe('TechniqueRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('getTechniqueById', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueObject = {
        method_technique_id: 1,
        method_lookup_id: 2,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        attractants: [],
        attributes: {
          qualitative_attributes: [],
          quantitative_attributes: []
        }
      };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await repository.getTechniqueById(surveyId, methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('getTechniquesForSurveyId', () => {
    it('should run successfully', async () => {
      const mockRecord: TechniqueObject = {
        method_technique_id: 1,
        method_lookup_id: 2,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        attractants: [],
        attributes: {
          qualitative_attributes: [],
          quantitative_attributes: []
        }
      };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;
      const pagination = undefined;

      const response = await repository.getTechniquesForSurveyId(surveyId, pagination);

      expect(response).to.eql([mockRecord]);
    });
  });

  describe('getTechniquesCountForSurveyId', () => {
    it('should run successfully', async () => {
      const mockRecord = { count: 10 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;

      const response = await repository.getTechniquesCountForSurveyId(surveyId);

      expect(response).to.equal(10);
    });
  });

  describe('insertTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;
      const techniqueObject: ITechniqueRowDataForInsert = {
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        method_lookup_id: 2
      };

      const response = await repository.insertTechnique(surveyId, techniqueObject);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('updateTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;
      const techniqueObject: ITechniqueRowDataForUpdate = {
        method_technique_id: 1,
        name: 'name',
        description: 'desc',
        distance_threshold: 200,
        method_lookup_id: 2
      };

      const response = await repository.updateTechnique(surveyId, techniqueObject);

      expect(response).to.eql(mockRecord);
    });
  });

  describe('deleteTechnique', () => {
    it('should run successfully', async () => {
      const mockRecord = { method_technique_id: 1 };

      const mockResponse = { rows: [mockRecord], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new TechniqueRepository(dbConnection);

      const surveyId = 1;
      const methodTechniqueId = 2;

      const response = await repository.deleteTechnique(surveyId, methodTechniqueId);

      expect(response).to.eql(mockRecord);
    });
  });
});
