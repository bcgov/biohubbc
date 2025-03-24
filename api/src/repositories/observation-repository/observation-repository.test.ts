import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SQLStatement } from 'sql-template-strings';
import { getMockDBConnection } from '../../__mocks__/db';
import { ObservationRepository } from './observation-repository';

chai.use(sinonChai);

describe('ObservationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('findObservations', () => {
    it('should return a list of observations when all filters provided', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ObservationRepository(dbConnection);

      const response = await repository.findObservations(
        true,
        1,
        {
          keyword: 'term',
          itis_tsns: [1234, 2345],
          itis_tsn: undefined,
          start_date: '2023-01-01',
          end_date: '2023-01-01',
          start_time: '12:00:00',
          end_time: '12:00:00',
          min_count: 3,
          system_user_id: 4
        },
        {
          limit: 10,
          page: 1,
          sort: 'name',
          order: 'asc'
        }
      );

      expect(response).to.eql([{ id: 1 }]);
    });

    it('should return a list of observations when no filters provided', async () => {
      const mockResponse = { rows: [{ id: 1 }], rowCount: 1 } as any as Promise<QueryResult<any>>;
      const dbConnection = getMockDBConnection({ knex: () => mockResponse });

      const repository = new ObservationRepository(dbConnection);

      const response = await repository.findObservations(false, 1, undefined, undefined);

      expect(response).to.eql([{ id: 1 }]);
    });
  });

  describe('deleteObservationsNotInArray', () => {
    it('should delete all records except for the ids in the provided array', async () => {
      const mockQueryResponse = { rows: [], rowCount: 3 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const surveyId = 1;
      const retainedObservationIds = [11, 22];

      const repo = new ObservationRepository(mockDBConnection);

      const response = await repo.deleteObservationsNotInArray(surveyId, retainedObservationIds);

      expect(response).to.equal(3);
      expect(mockDBConnection.sql).to.have.been.calledOnceWith(
        sinon.match((sqlStatement: SQLStatement) => {
          return ['survey_observation_id', 'NOT IN', '(11,22)'].every((term) => sqlStatement.text.includes(term));
        })
      );
    });

    it('should delete all records when provided array of ids is empty', async () => {
      const mockQueryResponse = { rows: [], rowCount: 3 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const surveyId = 1;
      const retainedObservationIds: number[] = [];

      const repo = new ObservationRepository(mockDBConnection);

      const response = await repo.deleteObservationsNotInArray(surveyId, retainedObservationIds);

      expect(response).to.equal(3);
      expect(mockDBConnection.sql).to.have.been.calledOnce;
      expect(mockDBConnection.sql).not.to.have.been.calledWith(
        sinon.match((sqlStatement: SQLStatement) => {
          return ['survey_observation_id', 'NOT IN'].every((term) => sqlStatement.text.includes(term));
        })
      );
    });
  });

  describe('getSurveyObservations', () => {
    it('get all observations for a survey when some observation records exist', async () => {
      const mockRows = [{}, {}];
      const mockQueryResponse = { rows: mockRows, rowCount: 2 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repository = new ObservationRepository(mockDBConnection);

      const surveyId = 1;

      const response = await repository.getSurveyObservations(surveyId);

      expect(response).to.be.eql(mockRows);
    });

    it('get all observations for a survey when no observation records exist', async () => {
      const mockRows: any[] = [];
      const mockQueryResponse = { rows: mockRows, rowCount: 2 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repository = new ObservationRepository(mockDBConnection);

      const surveyId = 1;

      const response = await repository.getSurveyObservations(surveyId);

      expect(response).to.be.eql(mockRows);
    });
  });

  describe('getSurveyObservationsCount', () => {
    it('gets the count of survey observations for the given survey', async () => {
      const mockQueryResponse = { rows: [{ count: 1 }] } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repo = new ObservationRepository(mockDBConnection);

      const response = await repo.getSurveyObservationsCount(1);

      expect(response).to.eql(1);
    });
  });

  describe('getObservedSpeciesForSurvey', () => {
    it('gets observed species for a given survey', async () => {
      const mockQueryResponse = { rows: [{ itis_tsn: 5 }], rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repo = new ObservationRepository(mockDBConnection);

      const response = await repo.getObservedSpeciesForSurvey(1);

      expect(response).to.eql([{ itis_tsn: 5 }]);
    });
  });

  describe('getObservationsCountBySampleSiteIds', () => {
    it('gets the observation count by sample site ids', async () => {
      const mockQueryResponse = { rows: [{ count: 50 }], rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repo = new ObservationRepository(mockDBConnection);

      const response = await repo.getObservationsCountBySampleSiteIds(1, [1]);

      expect(response).to.eql(50);
    });
  });
});
