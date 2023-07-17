import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { BcgwLayerService } from '../../services/bcgw-layer-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as regions from './regions';

chai.use(sinonChai);

describe('getRegions', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches error, and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(BcgwLayerService.prototype, 'getRegionsForFeature').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
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
    };

    const requestHandler = regions.getRegions();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('successfully returns an empty array', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(BcgwLayerService.prototype, 'getRegionsForFeature').resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
      features: []
    };

    const requestHandler = regions.getRegions();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.eql(200);
    expect(mockRes.jsonValue).to.eql({ regions: [] });
  });

  it('gets all regions from features', async () => {
    const dbConnectionObj = getMockDBConnection();

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

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = {
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
    };

    const result = regions.getRegions();

    await result(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({
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
