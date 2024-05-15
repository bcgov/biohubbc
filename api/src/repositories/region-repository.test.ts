import chai, { expect } from 'chai';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getMockDBConnection } from '../__mocks__/db';
import { RegionRepository } from './region-repository';

chai.use(sinonChai);

describe('RegionRepository', () => {
  afterEach(() => {
    sinon.restore();
  });


  describe('addRegionsToASurvey', () => {
    it('should return early when no regions passed in', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      const insertSQL = sinon.stub(mockDBConnection, 'sql').returns({} as unknown as any);

      await repo.addRegionsToSurvey(1, []);
      expect(insertSQL).to.not.be.called;
    });

    it('should throw issue when SQL fails', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      sinon.stub(mockDBConnection, 'sql').throws('SQL FAILED');

      try {
        await repo.addRegionsToSurvey(1, [1]);
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to execute insert SQL for survey_region');
      }
    });

    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      const insertSQL = sinon.stub(mockDBConnection, 'sql').returns({} as unknown as any);

      await repo.addRegionsToSurvey(1, [1]);
      expect(insertSQL).to.be.called;
    });
  });


  describe('deleteRegionsForSurvey', () => {
    it('should run without issue', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      const sqlStub = sinon.stub(mockDBConnection, 'sql').returns({} as unknown as any);

      await repo.deleteRegionsForSurvey(1);
      expect(sqlStub).to.be.called;
    });

    it('should throw an error when SQL fails', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      sinon.stub(mockDBConnection, 'sql').throws();

      try {
        await repo.deleteRegionsForSurvey(1);
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to execute delete SQL for survey_regions');
      }
    });
  });

  describe('deleteRegionsFromASurvey', () => {
    it('should return list of regions', async () => {
      const mockDBConnection = getMockDBConnection({
        knex: async () =>
          ({
            rowCount: 1,
            rows: [
              {
                region_id: 1,
                region_name: 'region name',
                org_unit: '1',
                org_unit_name: 'org unit name',
                feature_code: '11_code',
                feature_name: 'source_layer',
                object_id: 1234,
                geojson: '{}',
                geography: '{}'
              }
            ]
          } as any as Promise<QueryResult<any>>)
      });
      const repo = new RegionRepository(mockDBConnection);

      const response = await repo.searchRegionsWithDetails([
        {
          regionName: 'regionName',
          sourceLayer: 'source_layer'
        }
      ]);
      expect(response[0].region_name).to.be.eql('region name');
      expect(response[0].feature_name).to.be.eql('source_layer');
    });

    it('should throw an error when SQL fails', async () => {
      const mockDBConnection = getMockDBConnection();
      const repo = new RegionRepository(mockDBConnection);
      sinon.stub(mockDBConnection, 'knex').throws();

      try {
        await repo.searchRegionsWithDetails([
          {
            regionName: 'regionName',
            sourceLayer: 'source_layer'
          }
        ]);
        expect.fail();
      } catch (error) {
        expect((error as ApiExecuteSQLError).message).to.be.eql('Failed to execute search region SQL');
      }
    });
  });
});
