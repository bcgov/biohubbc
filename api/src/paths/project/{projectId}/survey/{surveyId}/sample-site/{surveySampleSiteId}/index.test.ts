import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { deleteSurveySampleSiteRecord, getSurveySampleLocationRecord, updateSurveySampleSite } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { UpdateSampleSiteRecord } from '../../../../../../../repositories/sample-site-repository';
import { ObservationService } from '../../../../../../../services/observation-service';
import { SampleSiteService } from '../../../../../../../services/sample-site-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('updateSurveySampleSite', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error if SampleSiteService throws an error', async () => {
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
        geojson: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {},
          id: 'testid1'
        },
        geography: 'geography',
        create_date: 'create_date',
        create_user: 1,
        update_date: 'update_date',
        update_user: 2,
        revision_count: 1,
        sample_methods: [],
        blocks: [],
        stratums: []
      } as UpdateSampleSiteRecord
    };

    sinon.stub(SampleSiteService.prototype, 'updateSampleLocationMethodPeriod').rejects(new Error('an error'));

    try {
      const requestHandler = updateSurveySampleSite();

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
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      sampleSite: {
        survey_id: 1001,
        survey_sample_site_id: 2,
        name: 'name',
        description: 'description',
        geojson: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {},
          id: 'testid1'
        },
        geography: 'geography',
        create_date: 'create_date',
        create_user: 1,
        update_date: 'update_date',
        update_user: 2,
        revision_count: 1,
        sample_methods: [],
        blocks: [],
        stratums: []
      } as UpdateSampleSiteRecord
    };

    const updateSampleLocationMethodPeriodStub = sinon
      .stub(SampleSiteService.prototype, 'updateSampleLocationMethodPeriod')
      .resolves();

    const requestHandler = updateSurveySampleSite();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(updateSampleLocationMethodPeriodStub).to.have.been.calledOnceWithExactly(1001, mockReq.body.sampleSite);
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
      const result = deleteSurveySampleSiteRecord();
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

  it('should successfully delete a survey sample site record', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getObservationsCountBySampleSiteIdStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountBySampleSiteIds')
      .resolves(0);

    const deleteSampleLocationRecordStub = sinon.stub(SampleSiteService.prototype, 'deleteSampleSiteRecord').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      participants: [[1, 1, 'job']]
    };

    const requestHandler = deleteSurveySampleSiteRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(deleteSampleLocationRecordStub).to.have.been.calledOnce;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });

  it('should successfully delete a survey sample site record', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getObservationsCountBySampleSiteIdStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountBySampleSiteIds')
      .resolves(0);

    const deleteSampleLocationRecordStub = sinon.stub(SampleSiteService.prototype, 'deleteSampleSiteRecord').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    mockReq.body = {
      participants: [[1, 1, 'job']]
    };

    const requestHandler = deleteSurveySampleSiteRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(deleteSampleLocationRecordStub).to.have.been.calledOnce;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });
});

describe('getSurveySampleLocationRecord', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully get a sample location record', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveySampleLocationBySiteIdStub = sinon
      .stub(SampleSiteService.prototype, 'getSurveySampleLocationBySiteId')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    const requestHandler = getSurveySampleLocationRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(getSurveySampleLocationBySiteIdStub).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockError = new Error('a test error');

    sinon.stub(SampleSiteService.prototype, 'getSurveySampleLocationBySiteId').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    const requestHandler = getSurveySampleLocationRecord();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('a test error');

      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    }
  });
});
