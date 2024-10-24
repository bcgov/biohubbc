import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyCritterRepository } from './survey-critter-repository';

chai.use(sinonChai);

describe('SurveyRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getCrittersInSurvey', () => {
    it('should return result', async () => {
      const mockSurveyCritter = { critter_id: 1, survey_id: 1, critterbase_critter_id: 1 };
      const mockResponse = { rows: [mockSurveyCritter], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyCritterRepository(dbConnection);

      const response = await repository.getCrittersInSurvey(1);

      expect(response).to.eql([mockSurveyCritter]);
    });
  });

  describe('addCrittersToSurvey', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ critter_id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyCritterRepository(dbConnection);

      const response = await repository.addCrittersToSurvey(1, ['critter_id']);

      expect(response).to.be.deep.equal([1]);
    });
  });

  describe('removeCrittersFromSurvey', () => {
    it('should return result', async () => {
      const mockResponse = { rows: [{ submissionId: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new SurveyCritterRepository(dbConnection);

      const response = await repository.removeCrittersFromSurvey(1, [1]);

      expect(response).to.be.undefined;
    });
  });

  describe('updateCritter', () => {
    it('should update existing row', async () => {
      const mockResponse = { rows: [], rowCount: 0 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });
      const repository = new SurveyCritterRepository(dbConnection);
      const response = await repository.updateCritter(1, 'asdf');
      expect(response).to.be.undefined;
    });
  });
});
