import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as create_survey_sample_site_record from './index';
import * as get_survey_sample_site_record from './index';

chai.use(sinonChai);

describe('getSurveySampleLocationRecords', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should throw a 400 error when no surveyId is provided', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    try {
      const requestHandler = get_survey_sample_site_record.getSurveySampleLocationRecords();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required param `surveyId`');
    }
  });

  it('should catch and re-throw an error if SampleLocationService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    sinon.stub(SampleLocationService.prototype, 'getSampleLocationsForSurveyId').rejects(new Error('an error'));

    try {
      const requestHandler = get_survey_sample_site_record.getSurveySampleLocationRecords();

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
      surveyId: '1'
    };

    const sampleLocation = {
      survey_sample_site_id: 1,
      survey_id: 1,
      name: 'name',
      description: 'description',
      geojson: 'geojson',
      geography: 'geography',
      create_date: 'create_date',
      create_user: 1,
      update_date: 'update_date',
      update_user: 2,
      revision_count: 1,
      sample_methods: [],
      sample_blocks: [],
      sample_stratums: []
    };

    sinon.stub(SampleLocationService.prototype, 'getSampleLocationsCountBySurveyId').resolves(1);
    sinon.stub(SampleLocationService.prototype, 'getSampleLocationsForSurveyId').resolves([sampleLocation]);

    const requestHandler = get_survey_sample_site_record.getSurveySampleLocationRecords();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({
      sampleSites: [sampleLocation],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 1,
        sort: undefined,
        order: undefined,
        total: 1
      }
    });
  });
});

describe('createSurveySampleSiteRecord', () => {
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

  it('should throw a 400 error when no surveyId in the param', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = create_survey_sample_site_record.createSurveySampleSiteRecord();
      await result(
        { ...sampleReq, params: { ...sampleReq.params, surveyId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required path param `surveyId`');
    }
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertSurveyParticipantStub = sinon.stub(SampleLocationService.prototype, 'insertSampleLocations').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      surveyId: '1'
    };

    mockReq.body = {
      participants: [[1, 1, 'job']]
    };

    const requestHandler = create_survey_sample_site_record.createSurveySampleSiteRecord();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(201);
    expect(insertSurveyParticipantStub).to.have.been.calledOnce;
  });
});
