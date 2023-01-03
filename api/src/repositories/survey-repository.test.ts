import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { SurveyRepository } from './survey-repository';

chai.use(sinonChai);

describe('SurveyRepository', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('deleteSurvey', () => {
    it('should return result', async () => {
      const mockResponse = ({ rows: [{ id: 1 }], rowCount: 1 } as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      const response = await repository.deleteSurvey(1);

      expect(response).to.eql(undefined);
    });

    it('should throw an error', async () => {
      const mockResponse = (undefined as any) as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ sql: () => mockResponse });

      const repository = new SurveyRepository(dbConnection);

      try {
        await repository.deleteSurvey(1);
        expect.fail();
      } catch (error) {
        expect((error as Error).message).to.equal('Failed to delete Survey');
      }
    });
  });
});
