import chai, { expect } from 'chai';
import { Feature } from 'geojson';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ZodError } from 'zod';
import * as db from '../../database/db';
import { BcgwLayerService } from '../../services/bcgw-layer-service';
//import { HTTPError } from '../../errors/http-error';
import { getMockDBConnection } from '../../__mocks__/db';
import * as regions from './regions';

chai.use(sinonChai);

describe.only('getRegions', () => {
  const dbConnectionObj = getMockDBConnection();

  it('throws a ZodError for invalid geoJSON features', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const sampleReq = {
      body: {
        features: [{ __invalidGeoJsonFeature: true }]
      }
    } as any;

    /*
    const actualResult: any = {
      id: null,
      date: null
    };

    const sampleRes = {
      status: () => {
        return {
          json: (result: any) => {
            actualResult = result;
          }
        };
      }
    };
    */

    try {
      const result = regions.getRegions();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError: any) {
      expect(actualError).to.be.instanceOf(ZodError);
    }
  });

  it.only('sorts features into known and unknown arrays', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(BcgwLayerService.prototype, 'findRegionName').callsFake((feature: Feature) => {
      return (
        (feature.id &&
          {
            testid1: null,
            testid2: { regionName: 'region2', sourceLayer: 'source2' },
            testid3: null,
            testid4: { regionName: 'region4', sourceLayer: 'source4' }
          }[feature.id]) ||
        null
      );
    });

    const sampleReq = {
      body: {
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid1'
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid2'
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid3'
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
            id: 'testid4'
          }
        ]
      }
    } as any;

    /*
    const actualResult: any = {
      id: null,
      date: null
    };

    const sampleRes = {
      status: () => {
        return {
          json: (result: any) => {
            actualResult = result;
          }
        };
      }
    };
    */

    const result = regions.getRegions();

    await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
  });
});
