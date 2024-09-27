import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createSurveySampleMethodRecord, getSurveySampleMethodRecords } from '.';
import * as db from '../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../errors/http-error';
import { SampleLocationService } from '../../../../../../../../services/sample-location-service';
import { SampleMethodService } from '../../../../../../../../services/sample-method-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('getSurveySampleMethodRecords', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveySampleSiteId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = getSurveySampleMethodRecords();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleSiteId`');
    }
  });

  it('should catch and re-throw an error if SampleMethodService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleSiteId: '1'
    };

    sinon.stub(SampleMethodService.prototype, 'getSampleMethodsForSurveySampleSiteId').rejects(new Error('an error'));

    try {
      const requestHandler = getSurveySampleMethodRecords();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return sampleMethods on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleSiteId: '1'
    };

    const sampleMethod = {
      survey_sample_method_id: 1,
      survey_sample_site_id: 1,
      method_response_metric_id: 1,
      method_technique_id: 1,
      description: 'desc',
      create_date: 'date',
      create_user: 1,
      update_date: 'date',
      update_user: 1,
      revision_count: 1,
      sample_periods: []
    };

    sinon.stub(SampleMethodService.prototype, 'getSampleMethodsForSurveySampleSiteId').resolves([sampleMethod]);

    const requestHandler = getSurveySampleMethodRecords();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({
      sampleMethods: [sampleMethod]
    });
  });
});

describe('createSurveySampleMethodRecord', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      participants: [[1, 1, 'job']]
    },
    params: {
      surveyId: 1
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveySampleSiteId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = createSurveySampleMethodRecord();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveySampleSiteId: null } },
        null as unknown as any,
        null as unknown as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleSiteId`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveySampleSiteByIdStub = sinon
      .stub(SampleLocationService.prototype, 'getSurveySampleSiteById')
      .resolves({
        survey_sample_site_id: 1,
        survey_id: 1,
        name: 'name',
        description: 'desc',
        geometry: null,
        geography: 'geography',
        geojson: {},
        create_date: 'date',
        create_user: 1,
        update_date: 'date',
        update_user: 1,
        revision_count: 1
      });

    const insertSurveyParticipantStub = sinon.stub(SampleMethodService.prototype, 'insertSampleMethod').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleSiteId: '1'
    };

    const sampleMethod = {
      survey_sample_method_id: 1,
      survey_sample_site_id: 1,
      method_technique_id: 1,
      description: 'desc',
      create_date: 'date',
      create_user: 1,
      update_date: 'date',
      update_user: 1,
      revision_count: 1,
      sample_periods: []
    };

    mockReq.body = {
      sampleMethod: [sampleMethod]
    };

    const requestHandler = createSurveySampleMethodRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(201);
    expect(getSurveySampleSiteByIdStub).to.have.been.calledOnce;
    expect(insertSurveyParticipantStub).to.have.been.calledOnce;
  });
});
