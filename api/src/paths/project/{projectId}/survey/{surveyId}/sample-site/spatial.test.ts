import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { getSurveySampleSitesGeometry } from './spatial';

chai.use(sinonChai);

describe('getSurveySampleSitesGeometry', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error if SampleLocationService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    sinon.stub(SampleLocationService.prototype, 'getSampleLocationsGeometryBySurveyId').rejects(new Error('an error'));

    try {
      const requestHandler = getSurveySampleSitesGeometry();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return sampleSites on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    const sampleSiteData = [
      {
        survey_sample_site_id: 1,
        geojson: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } }
      },
      {
        survey_sample_site_id: 2,
        geojson: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [1, 1] } }
      }
    ];

    sinon.stub(SampleLocationService.prototype, 'getSampleLocationsGeometryBySurveyId').resolves(sampleSiteData);

    const requestHandler = getSurveySampleSitesGeometry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ sampleSites: sampleSiteData });
  });
});
