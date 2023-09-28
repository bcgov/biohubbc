import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SQLStatement } from 'sql-template-strings';
import { getMockDBConnection } from '../__mocks__/db';
import { InsertObservation, ObservationRepository, UpdateObservation } from './observation-repository';

chai.use(sinonChai);

describe.only('ObservationRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteObservationsNotInArray', () => {
    it('should delete all records except for the ids in the provided array', async () => {
      const mockQueryResponse = ({ rows: [], rowCount: 3 } as unknown) as QueryResult<any>;

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
      const mockQueryResponse = ({ rows: [], rowCount: 3 } as unknown) as QueryResult<any>;

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

  describe('insertUpdateSurveyObservations', () => {
    it('should upsert records and return the affected rows', async () => {
      const mockRows = [{}, {}];
      const mockQueryResponse = ({ rows: mockRows, rowCount: 2 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        sql: sinon.stub().resolves(mockQueryResponse)
      });

      const repo = new ObservationRepository(mockDBConnection);

      const surveyId = 1;
      const observations: (InsertObservation | UpdateObservation)[] = [
        {
          survey_id: 1,
          wldtaxonomic_units_id: 2,
          latitude: 3,
          longitude: 4,
          count: 5,
          observation_date: '2023-01-01',
          observation_time: '12:00:00'
        } as InsertObservation,
        {
          survey_observation_id: 6,
          wldtaxonomic_units_id: 7,
          latitude: 8,
          longitude: 9,
          count: 10,
          observation_date: '2023-02-02',
          observation_time: '13:00:00'
        } as UpdateObservation
      ];

      const response = await repo.insertUpdateSurveyObservations(surveyId, observations);

      expect(response).to.be.eql(mockRows);
    });
  });

  describe('getSurveyObservations', () => {
    it('get all observations for a survey when some observation records exist', async () => {
      const mockRows = [{}, {}];
      const mockQueryResponse = ({ rows: mockRows, rowCount: 2 } as unknown) as QueryResult<any>;

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
      const mockQueryResponse = ({ rows: mockRows, rowCount: 2 } as unknown) as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const repository = new ObservationRepository(mockDBConnection);

      const surveyId = 1;

      const response = await repository.getSurveyObservations(surveyId);

      expect(response).to.be.eql(mockRows);
    });
  });
});
