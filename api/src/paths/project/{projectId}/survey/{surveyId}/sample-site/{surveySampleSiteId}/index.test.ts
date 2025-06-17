import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { deleteSurveySampleSiteRecord, getSurveySampleSite, updateSurveySampleSite } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../../services/observation-services/observation-service';
import { SampleSiteService, UpdateSampleSiteObject } from '../../../../../../../services/sample-site-service';
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

    const body: UpdateSampleSiteObject = {
      survey_sample_site_id: 1,
      name: 'name',
      description: 'description',
      geojson: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {},
        id: 'testid1'
      },
      blocks: [],
      stratums: []
    };

    mockReq.body = body;

    sinon.stub(SampleSiteService.prototype, 'updateSampleSite').rejects(new Error('an error'));

    try {
      const requestHandler = updateSurveySampleSite();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).message).to.equal('an error');
    }
  });

  it('should successfully update a survey sample site', async () => {
    const dbConnectionObj = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1001',
      surveySampleSiteId: '2'
    };

    const body: UpdateSampleSiteObject = {
      survey_sample_site_id: 1001,
      name: 'name',
      description: 'description',
      geojson: {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] },
        properties: {},
        id: 'testid1'
      },
      blocks: [],
      stratums: []
    };

    mockReq.body = body;

    sinon.stub(SampleSiteService.prototype, 'updateSampleSite').resolves();

    const requestHandler = updateSurveySampleSite();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledOnceWith(204);

    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
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

    const deleteSampleSiteRecordStub = sinon.stub(SampleSiteService.prototype, 'deleteSampleSiteRecord').resolves();

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
    expect(deleteSampleSiteRecordStub).to.have.been.calledOnce;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });

  it('should successfully delete a survey sample site record 2', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getObservationsCountBySampleSiteIdStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountBySampleSiteIds')
      .resolves(0);

    const deleteSampleSiteRecordStub = sinon.stub(SampleSiteService.prototype, 'deleteSampleSiteRecord').resolves();

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
    expect(deleteSampleSiteRecordStub).to.have.been.calledOnce;
    expect(getObservationsCountBySampleSiteIdStub).to.have.been.calledOnce;
  });
});

describe('getSurveySampleSite', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should successfully get a sample site record', async () => {
    const dbConnectionObj = getMockDBConnection();
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveySampleSiteBySiteIdStub = sinon
      .stub(SampleSiteService.prototype, 'getSurveySampleSiteBySiteId')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    const requestHandler = getSurveySampleSite();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(getSurveySampleSiteBySiteIdStub).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockError = new Error('a test error');

    sinon.stub(SampleSiteService.prototype, 'getSurveySampleSiteBySiteId').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1',
      surveySampleSiteId: '2'
    };

    const requestHandler = getSurveySampleSite();

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
