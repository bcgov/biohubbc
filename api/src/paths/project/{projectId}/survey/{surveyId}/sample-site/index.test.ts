import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SampleSiteService } from '../../../../../../services/sample-site-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as create_survey_sample_site_record from './index';
import * as get_survey_sample_site_record from './index';

chai.use(sinonChai);

describe('getSurveySampleSitesForSurvey', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should catch and re-throw an error if SampleSiteService throws an error', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '1'
    };

    sinon.stub(SampleSiteService.prototype, 'getSampleSitesForSurveyId').rejects(new Error('an error'));

    try {
      const requestHandler = get_survey_sample_site_record.getSurveySampleSitesForSurvey();

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
      blocks: [],
      stratums: []
    };

    sinon.stub(SampleSiteService.prototype, 'getSampleLocationsCountBySurveyId').resolves(1);
    sinon.stub(SampleSiteService.prototype, 'getSampleSitesForSurveyId').resolves([sampleLocation]);

    const requestHandler = get_survey_sample_site_record.getSurveySampleSitesForSurvey();

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

  afterEach(() => {
    sinon.restore();
  });

  it('should work', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertSurveyParticipantStub = sinon.stub(SampleSiteService.prototype, 'insertSampleLocations').resolves();

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
