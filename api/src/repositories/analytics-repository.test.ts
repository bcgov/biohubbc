import chai, { expect } from 'chai';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from '../__mocks__/db';
import { AnalyticsRepository } from './analytics-repository';

chai.use(sinonChai);

describe('AnalyticsRepository', () => {
  it('should construct', () => {
    const mockDBConnection = getMockDBConnection();
    const analyticsRepository = new AnalyticsRepository(mockDBConnection);

    expect(analyticsRepository).to.be.instanceof(AnalyticsRepository);
  });

  describe('getObservationCountByGroup', () => {
    it('Creates and executes sql query with empty params', async () => {
      const mockRows = [
        {
          row_count: 10,
          individual_count: 5,
          individual_percentage: 50,
          quant_measurements: {},
          qual_measurements: {
            critterbase_taxon_measurement_id: '1',
            option_id: '2'
          }
        }
      ];
      const mockQueryResponse = { rows: mockRows, rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const analyticsRepository = new AnalyticsRepository(mockDBConnection);

      const response = await analyticsRepository.getObservationCountByGroup([], [], [], []);

      expect(response).to.be.an('array');
    });

    it('Creates and executes sql query with non-empty params', async () => {
      const mockRows = [
        {
          row_count: 10,
          individual_count: 5,
          individual_percentage: 50,
          quant_measurements: {},
          qual_measurements: {
            critterbase_taxon_measurement_id: '1',
            option_id: '2'
          }
        }
      ];
      const mockQueryResponse = { rows: mockRows, rowCount: 1 } as unknown as QueryResult<any>;

      const mockDBConnection = getMockDBConnection({
        knex: sinon.stub().resolves(mockQueryResponse)
      });

      const analyticsRepository = new AnalyticsRepository(mockDBConnection);

      const response = await analyticsRepository.getObservationCountByGroup(
        [1, 2, 3],
        ['column1', 'column2'],
        ['quant1', 'quant2'],
        ['qual1', 'qual2']
      );

      expect(response).to.be.an('array');
    });
  });
});
