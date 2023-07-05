import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { BcgwLayerService } from '../../services/bcgw-layer-service';
import { getMockDBConnection } from '../../__mocks__/db';
import * as regions from './regions';

chai.use(sinonChai);

describe('getRegions', () => {
  const dbConnectionObj = getMockDBConnection();

  afterEach(() => {
    sinon.restore();
  });

  it('successfully returns an empty array', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(BcgwLayerService.prototype, 'getRegionsForFeature').resolves([]);

    const sampleReq = {
      body: {
        features: []
      }
    } as any;

    let actualResult: any = {
      regions: []
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

    const result = regions.getRegions();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      regions: []
    });
  });

  it('gets all regions from features', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getRegionsForFeatureStub = sinon.stub(BcgwLayerService.prototype, 'getRegionsForFeature');

    getRegionsForFeatureStub.onCall(0).resolves([
      { regionName: 'region1', sourceLayer: 'source1' },
      { regionName: 'region5', sourceLayer: 'source5' }
    ]);

    getRegionsForFeatureStub.onCall(1).resolves([
      { regionName: 'region1', sourceLayer: 'source1' },
      { regionName: 'region2', sourceLayer: 'source2' }
    ]);

    getRegionsForFeatureStub.onCall(2).resolves([
      { regionName: 'region2', sourceLayer: 'source2' },
      { regionName: 'region3', sourceLayer: 'source3' },
      { regionName: 'region4', sourceLayer: 'source4' }
    ]);

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
          }
        ]
      }
    } as any;

    let actualResult: any = {
      regions: []
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

    const result = regions.getRegions();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      regions: [
        { regionName: 'region1', sourceLayer: 'source1' },
        { regionName: 'region5', sourceLayer: 'source5' },
        { regionName: 'region2', sourceLayer: 'source2' },
        { regionName: 'region3', sourceLayer: 'source3' },
        { regionName: 'region4', sourceLayer: 'source4' }
      ]
    });
  });
});
