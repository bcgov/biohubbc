import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../services/observation-service';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as delete_survey_sample_sites from './delete';

chai.use(sinonChai);

describe('deleteSurveySampleSiteRecords', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      surveySampleSiteIds: [[1, 2, 3]]
    },
    params: {
      projectId: 1,
      surveyId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveySampleSiteId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_survey_sample_sites.deleteSurveySampleSiteRecords();
      await result(
        { ...sampleReq, params: sampleReq.params, body: { surveySampleSiteIds: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body `surveySampleSiteIds`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getObservationsCountBySampleSiteIdStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountBySampleSiteIds')
      .resolves({ observationCount: 0 });

    const deleteSampleLocationRecordStub = sinon
      .stub(SampleLocationService.prototype, 'deleteSampleLocationRecord')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      surveySampleSiteIds: [1, 2, 3]
    };

    const requestHandler = delete_survey_sample_sites.deleteSurveySampleSiteRecords();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(deleteSampleLocationRecordStub).to.have.been.calledThrice;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });
});
