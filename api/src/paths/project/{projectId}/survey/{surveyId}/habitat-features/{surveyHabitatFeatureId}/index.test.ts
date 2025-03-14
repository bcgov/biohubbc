import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { deleteSurveyHabitatFeature, getSurveyHabitatFeature, putSurveyHabitatFeature } from '.';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { SurveyHabitatFeatureWithTaxonsAndSampling } from '../../../../../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { SurveyHabitatFeatureService } from '../../../../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

chai.use(sinonChai);

describe('putSurveyHabitatFeature', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should handle and re-throw errors', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(SurveyHabitatFeatureService.prototype, 'updateSurveyHabitatFeature').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    mockReq.body = {
      surveyHabitatFeature: {
        habitat_feature_type_id: 1,
        latitude: 49,
        longitude: -123,
        count: 2,
        observed_date: '2024-12-01',
        observed_time: '08:00:00'
      }
    };

    const requestHandler = putSurveyHabitatFeature();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('a test error');

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).not.to.have.been.called;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });

  it('should successfully update a survey habitat feature', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const updateSurveyHabitatFeatureStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'updateSurveyHabitatFeature')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    mockReq.body = {
      surveyHabitatFeature: {
        habitat_feature_type_id: 1,
        latitude: 49,
        longitude: -123,
        count: 2,
        observed_date: '2024-12-01',
        observed_time: '08:00:00'
      }
    };

    const requestHandler = putSurveyHabitatFeature();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(updateSurveyHabitatFeatureStub).to.have.been.calledOnceWith(2, 3, mockReq.body.surveyHabitatFeature);
    expect(mockRes.status).to.have.been.calledOnceWith(204);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.rollback).not.to.have.been.called;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});

describe('getSurveyHabitatFeature', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should handle and re-throw errors', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeature').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    const requestHandler = getSurveyHabitatFeature();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('a test error');

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).not.to.have.been.called;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });

  it('should successfully get a survey habitat feature', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockHabitatFeatureRecord: SurveyHabitatFeatureWithTaxonsAndSampling = {
      survey_habitat_feature_id: 1,
      habitat_feature_type_id: 2,
      survey_id: 4,
      count: 2,
      latitude: 49,
      longitude: -123,
      observed_date: '2024-12-01',
      observed_time: '08:00:00',
      survey_sample_period_id: 3,
      survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
      survey_sample_site_id: 4,
      survey_sample_site_name: 'site',
      method_technique_id: 5,
      method_technique_name: 'technique',
      survey_habitat_feature_taxons: [
        {
          survey_habitat_feature_taxon_id: 3,
          survey_habitat_feature_id: 1,
          itis_tsn: 123,
          itis_scientific_name: 'alces',
          comment: 'comment'
        }
      ]
    };

    const mockResponse = {
      surveyHabitatFeature: mockHabitatFeatureRecord,
      supplementaryData: {
        count: 1,
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      }
    };

    sinon.stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeature').resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    const requestHandler = getSurveyHabitatFeature();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.json).to.have.been.calledOnceWith(mockResponse);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});

describe('deleteSurveyHabitatFeature', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteSurveyHabitatFeatureStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'deleteSurveyHabitatFeature')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    const requestHandler = deleteSurveyHabitatFeature();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(deleteSurveyHabitatFeatureStub).to.have.been.calledOnceWith(2, 3);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('should delete survey habitat feature records', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteSurveyHabitatFeatureStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'deleteSurveyHabitatFeature')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      surveyHabitatFeatureId: '3'
    };

    const requestHandler = deleteSurveyHabitatFeature();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(deleteSurveyHabitatFeatureStub).to.have.been.calledOnceWith(2, 3);

    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(204);
    expect(mockRes.send).to.have.been.calledOnce;

    expect(mockDBConnection.rollback).not.to.have.been.called;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
