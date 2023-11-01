import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../../services/observation-service';
import { SampleLocationService } from '../../../../../../../services/sample-location-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import * as delete_survey_sample_site_record from './index';
import * as put_survey_sample_site from './index';

chai.use(sinonChai);

describe('updateSurveySampleSite', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = put_survey_sample_site.updateSurveySampleSite();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should throw a 400 error when no surveySampleSiteId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    try {
      const requestHandler = put_survey_sample_site.updateSurveySampleSite();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveySampleSiteId`');
    }
  });

  it('should throw a 400 error when no sampleSite is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    try {
      const requestHandler = put_survey_sample_site.updateSurveySampleSite();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required body param `sampleSite`');
    }
  });

  it('should catch and re-throw an error if SampleLocationService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      sampleSite: {
        survey_id: 1,
        survey_sample_site_id: 1,
        name: 'name',
        description: 'description',
        geojson: 'geojson',
        geography: 'geography',
        create_date: 'create_date',
        create_user: 1,
        update_date: 'update_date',
        update_user: 2,
        revision_count: 1,
        sample_methods: []
      }
    };

    sinon.stub(SampleLocationService.prototype, 'updateSampleLocationMethodPeriod').rejects(new Error('an error'));

    try {
      const requestHandler = put_survey_sample_site.updateSurveySampleSite();

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
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    const sampleSite = {
      survey_id: 1,
      survey_sample_site_id: 1,
      name: 'name',
      description: 'description',
      geojson: 'geojson',
      geography: 'geography',
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 2,
      revision_count: 1,
      sample_methods: []
    };

    mockReq.body = {
      sampleSite: sampleSite
    };

    const updateSampleLocationMethodPeriodStub = sinon
      .stub(SampleLocationService.prototype, 'updateSampleLocationMethodPeriod')
      .resolves();

    const requestHandler = put_survey_sample_site.updateSurveySampleSite();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(updateSampleLocationMethodPeriodStub).to.have.been.calledOnceWithExactly(sampleSite);
    expect(mockRes.status).to.have.been.calledWith(204);
  });
});

describe('deleteSurveySampleSiteRecord', () => {
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
      const result = delete_survey_sample_site_record.deleteSurveySampleSiteRecord();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveySampleSiteId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveySampleSiteId`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getObservationsCountBySampleSiteIdStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountBySampleSiteId')
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
      participants: [[1, 1, 'job']]
    };

    const requestHandler = delete_survey_sample_site_record.deleteSurveySampleSiteRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(deleteSampleLocationRecordStub).to.have.been.calledOnce;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });
});
