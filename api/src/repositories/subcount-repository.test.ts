import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import {
  InsertObservationSubCount,
  InsertSubCountEvent,
  ObservationSubCountRecord,
  SubCountCritterRecord,
  SubCountEventRecord,
  SubCountRepository
} from './subcount-repository';

chai.use(sinonChai);

describe('SubCountRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('insertObservationSubCount', () => {
    it('should successfully insert observation subcount', async () => {
      const mockSubcount: ObservationSubCountRecord = {
        observation_subcount_id: 1,
        survey_observation_id: 1,
        comment: 'comment',
        subcount: 5,
        observation_subcount_sign_id: null,
        create_date: '1970-01-01',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1
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

  describe('insertSubCountEvent', () => {
    it('should successfully insert subcount_event record', async () => {
      const mockInsertSubcountEvent: InsertSubCountEvent = {
        observation_subcount_id: 1,
        critterbase_event_id: 'aaaa'
      };

      const mockSubcountEvent: SubCountEventRecord = {
        observation_subcount_id: 1,
        create_date: '1970-01-01',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1,
        subcount_event_id: 1,
        critterbase_event_id: 'aaaa'
      };

      const mockResponse = {
        rows: [mockSubcountEvent],
        rowCount: 1
      } as any as Promise<QueryResult<any>>;

      const dbConnection = getMockDBConnection({
        knex: () => mockResponse
      });

      const repo = new SubCountRepository(dbConnection);
      const response = await repo.insertSubCountEvent(mockInsertSubcountEvent);

      expect(response).to.eql(mockSubcountEvent);
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
        await repo.insertSubCountEvent(null as unknown as InsertSubCountEvent);
        expect.fail();
      } catch (error) {
        expect((error as any as ApiExecuteSQLError).message).to.be.eq('Failed to insert subcount event');
      }
    });
  });

  describe('insertSubCountCritter', () => {
    it('should successfully insert a subcount_critter record', async () => {
      const mockSubcountCritterRecord: SubCountCritterRecord = {
        subcount_critter_id: 1,
        observation_subcount_id: 1,
        critter_id: 1,
        create_date: '1970-01-01',
        create_user: 1,
        update_date: null,
        update_user: null,
        revision_count: 1
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
        await repo.insertSubCountCritter(null as unknown as SubCountCritterRecord);
        expect.fail();
      } catch (error) {
        expect((error as any as ApiExecuteSQLError).message).to.be.eq('Failed to insert subcount critter');
      }
    });
  });
});
