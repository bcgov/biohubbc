import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ObservationSubcountRecord } from '../database-models/observation_subcount';
import { SubcountCritterRecord } from '../database-models/subcount_critter';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { InsertObservationSubCount, SubCountRepository } from './subcount-repository';

chai.use(sinonChai);

describe('SubCountRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertObservationSubCount', () => {
    it('should successfully insert observation subcount', async () => {
      const mockSubcount: ObservationSubcountRecord = {
        observation_subcount_id: 1,
        survey_observation_id: 1,
        comment: 'comment',
        subcount: 5
      };

      const mockResponse = {
        rows: [mockSubcount],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repo = new SubCountRepository(dbConnection);
      const response = await repo.insertObservationSubCount(mockSubcount);

      expect(response).to.eql(mockSubcount);
    });

    it('should catch query errors and throw an ApiExecuteSQLError', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repo = new SubCountRepository(dbConnection);
      try {
        await repo.insertObservationSubCount(null as unknown as InsertObservationSubCount);
        expect.fail();
      } catch (error) {
        expect((error as any as ApiExecuteSQLError).message).to.be.eq('Failed to insert observation subcount');
      }
    });
  });

  describe('insertSubCountCritter', () => {
    it('should successfully insert a subcount_critter record', async () => {
      const mockSubcountCritterRecord: SubcountCritterRecord = {
        subcount_critter_id: 1,
        observation_subcount_id: 1,
        critter_id: 1
      };

      const mockResponse = {
        rows: [mockSubcountCritterRecord],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repo = new SubCountRepository(dbConnection);
      const response = await repo.insertSubCountCritter(mockSubcountCritterRecord);

      expect(response).to.eql(mockSubcountCritterRecord);
    });

    it('should catch query errors and throw an ApiExecuteSQLError', async () => {
      const mockResponse = {
        rows: [],
        rowCount: 0
      } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repo = new SubCountRepository(dbConnection);
      try {
        await repo.insertSubCountCritter(null as unknown as SubcountCritterRecord);
        expect.fail();
      } catch (error) {
        expect((error as any as ApiExecuteSQLError).message).to.be.eq('Failed to insert subcount critter');
      }
    });
  });
});
