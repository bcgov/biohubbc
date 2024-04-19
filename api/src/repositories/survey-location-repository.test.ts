import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { PostSurveyLocationData } from '../models/survey-update';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyLocationRepository } from './survey-location-repository';

chai.use(sinonChai);

describe('SurveyLocationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertSurveyLocation', () => {
    it('should insert a survey location', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repository = new SurveyLocationRepository(dbConnection);

      const dataObj = {
        survey_location_id: 1,
        name: 'Updated Test Location',
        description: 'Updated Test Description',
        geojson: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [1, 1]
            },
            properties: {}
          }
        ],
        revision_count: 2
      };

      const data = new PostSurveyLocationData(dataObj);

      await repository.insertSurveyLocation(1, data);
      expect(dbConnection.sql).to.have.been.calledOnce;
    });
  });

  describe('updateSurveyLocation', () => {
    it('should update a survey location', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repository = new SurveyLocationRepository(dbConnection);

      const dataObj = {
        survey_location_id: 1,
        name: 'Updated Test Location',
        description: 'Updated Test Description',
        geojson: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [1, 1]
            },
            properties: {}
          }
        ],
        revision_count: 2
      };

      const data = new PostSurveyLocationData(dataObj);

      await repository.updateSurveyLocation(data);
      expect(dbConnection.sql).to.have.been.calledOnce;
    });
  });

  describe('getSurveyLocationsData', () => {
    it('should return a list of survey locations', async () => {
      const mockSurveyLocation = { survey_location_id: 1, name: 'Test Location', description: 'Test Description' };
      const mockResponse = { rows: [mockSurveyLocation], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repository = new SurveyLocationRepository(dbConnection);

      const response = await repository.getSurveyLocationsData(1);

      expect(response).to.eql([mockSurveyLocation]);
      expect(dbConnection.sql).to.have.been.calledOnce;
    });
  });

  describe('deleteSurveyLocation', () => {
    it('should delete a survey location', async () => {
      const mockSurveyLocation = { survey_location_id: 1, name: 'Test Location', description: 'Test Description' };
      const mockResponse = { rows: [mockSurveyLocation], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repository = new SurveyLocationRepository(dbConnection);
      const response = await repository.deleteSurveyLocation(1);

      expect(response).to.eql(mockSurveyLocation);
      expect(dbConnection.sql).to.have.been.calledOnce;
    });

    it('should throw an error when unable to delete the survey location', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: sinon.stub().resolves(mockResponse) });

      const repository = new SurveyLocationRepository(dbConnection);

      try {
        await repository.deleteSurveyLocation(1);
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });
});
