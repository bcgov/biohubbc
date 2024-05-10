import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../../../database/db';
import { HTTPError } from '../../../../../../../../../errors/http-error';
import { SampleMethodService } from '../../../../../../../../../services/sample-method-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../../__mocks__/db';
import * as delete_survey_sample_method_record from './index';
import * as put_survey_sample_method_record from './index';

chai.use(sinonChai);

describe('updateSurveySampleMethod', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveySampleSiteId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = put_survey_sample_method_record.updateSurveySampleMethod();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleSiteId`');
    }
  });

  it('should throw a 400 error when no surveySampleMethodId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleSiteId: '1'
    };

    try {
      const requestHandler = put_survey_sample_method_record.updateSurveySampleMethod();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleMethodId`');
    }
  });

  it('should throw a 400 error when no sampleMethod is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleMethodId: '1',
      surveySampleSiteId: '2'
    };

    try {
      const requestHandler = put_survey_sample_method_record.updateSurveySampleMethod();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `sampleMethod`');
    }
  });

  it('should catch and re-throw an error if SampleMethodService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleMethodId: '1',
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      sampleMethod: {
        method_lookup_id: 1,
        method_response_metric_id: 1,
        description: 'description'
      }
    };

    sinon.stub(SampleMethodService.prototype, 'updateSampleMethod').rejects(new Error('an error'));

    try {
      const requestHandler = put_survey_sample_method_record.updateSurveySampleMethod();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should return sampleLocations on success', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1001',
      surveySampleMethodId: '6',
      surveySampleSiteId: '9'
    };

    const sampleMethod = {
      method_lookup_id: 1,
      description: 'description',
      survey_sample_method_id: 6,
      survey_sample_site_id: 9
    };

    mockReq.body = {
      sampleMethod: sampleMethod
    };

    const updateSampleMethodStub = sinon.stub(SampleMethodService.prototype, 'updateSampleMethod').resolves();

    const requestHandler = put_survey_sample_method_record.updateSurveySampleMethod();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(updateSampleMethodStub).to.have.been.calledOnceWithExactly(1001, sampleMethod);
    expect(mockRes.status).to.have.been.calledWith(204);
  });
});

describe('deleteSurveySampleMethodRecord', () => {
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

  it('should throw a 400 error when no surveySampleMethodId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = delete_survey_sample_method_record.deleteSurveySampleMethodRecord();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveySampleMethodId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleMethodId`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const deleteSampleMethodRecordStub = sinon
      .stub(SampleMethodService.prototype, 'deleteSampleMethodRecord')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveySampleMethodId: '2'
    };

    mockReq.body = {
      participants: [[1, 1, 'job']]
    };

    const requestHandler = delete_survey_sample_method_record.deleteSurveySampleMethodRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(deleteSampleMethodRecordStub).to.have.been.calledOnce;
  });
});
