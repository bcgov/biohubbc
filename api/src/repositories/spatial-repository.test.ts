import chai, { expect } from 'chai';
import { FeatureCollection } from 'geojson';
import { describe } from 'mocha';
import { QueryResult } from 'pg';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import SQL from 'sql-template-strings';
import { ApiGeneralError } from '../errors/api-error';
import * as spatialUtils from '../utils/spatial-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { SpatialRepository } from './spatial-repository';

chai.use(sinonChai);

describe('SpatialRepository', () => {
  describe('getSpatialTransformRecords', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should succeed with valid data', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [
          {
            spatial_transform_id: 1,
            name: 'transform name',
            description: 'transform description',
            notes: 'notes',
            transform: 'transform details'
          }
        ]
      } as any) as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.getSpatialTransformRecords();

      expect(response[0].spatial_transform_id).to.equal(1);
      expect(response[0].name).to.equal('transform name');
      expect(response[0].description).to.equal('transform description');
      expect(response[0].notes).to.equal('notes');
      expect(response[0].transform).to.equal('transform details');
    });
  });

  describe('insertSpatialTransformSubmissionRecord', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when insert sql fails', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as any) as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      try {
        await spatialRepository.insertSpatialTransformSubmissionRecord(1, 1);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal(
          'Failed to insert spatial transform submission id and submission spatial component id'
        );
      }
    });

    it('should succeed with valid data', async () => {
      const mockQueryResponse = ({ rowCount: 1, rows: [{ spatial_transform_submission_id: 1 }] } as any) as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.insertSpatialTransformSubmissionRecord(1, 1);

      expect(response.spatial_transform_submission_id).to.equal(1);
    });
  });

  describe('runSpatialTransformOnSubmissionId', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should succeed with valid data', async () => {
      const mockQueryResponse = ({
        rowCount: 1,
        rows: [
          {
            result_data: {
              type: 'FeatureCollection',
              features: []
            } as FeatureCollection
          }
        ]
      } as any) as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        query: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.runSpatialTransformOnSubmissionId(1, 'string');

      expect(response).to.eql([
        {
          result_data: {
            type: 'FeatureCollection',
            features: []
          } as FeatureCollection
        }
      ]);
    });
  });

  describe('insertSubmissionSpatialComponent', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw an error when insert sql fails', async () => {
      const mockQueryResponse = ({ rowCount: 0 } as any) as Promise<QueryResult<any>>;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      try {
        await spatialRepository.insertSubmissionSpatialComponent(1, {} as FeatureCollection);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiGeneralError).message).to.equal(
          'Failed to insert submission spatial component details'
        );
      }
    });

    it('should succeed with valid data', async () => {
      const mockQueryResponse = ({ rowCount: 1, rows: [{ submission_spatial_component_id: 1 }] } as any) as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.insertSubmissionSpatialComponent(1, {} as FeatureCollection);

      expect(response.submission_spatial_component_id).to.equal(1);
    });

    it('should succeed with valid data and append geometry to sql statement', async () => {
      const mockQueryResponse = ({ rowCount: 1, rows: [{ submission_spatial_component_id: 1 }] } as any) as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const generateGeometryCollectionSQLStub = sinon
        .stub(spatialUtils, 'generateGeometryCollectionSQL')
        .returns(SQL`valid`);

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.insertSubmissionSpatialComponent(1, {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1]
            },
            properties: {}
          }
        ]
      } as FeatureCollection);

      expect(response.submission_spatial_component_id).to.equal(1);
      expect(generateGeometryCollectionSQLStub).to.be.calledOnce;
    });
  });

  describe('deleteSpatialComponentsBySubmissionId', () => {
    it('should successfully return submission IDs for delete spatial data', async () => {
      const mockQueryResponse = ({ rowCount: 1, rows: [{ occurrence_submission_id: 2 }] } as any) as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.deleteSpatialComponentsBySubmissionId(2);

      expect(response[0].occurrence_submission_id).to.equal(2);
    });
  });

  describe('deleteSpatialComponentsSpatialRefsBySubmissionId', () => {
    it('should successfully return submission IDs for deleted spatial component reference', async () => {
      const mockQueryResponse = ({ rowCount: 1, rows: [{ occurrence_submission_id: 2 }] } as any) as Promise<
        QueryResult<any>
      >;

      const mockDBConnection = getMockDBConnection({
        sql: async () => {
          return mockQueryResponse;
        }
      });

      const spatialRepository = new SpatialRepository(mockDBConnection);

      const response = await spatialRepository.deleteSpatialComponentsSpatialTransformRefsBySubmissionId(2);

      expect(response[0].occurrence_submission_id).to.equal(2);
    });
  });
});
