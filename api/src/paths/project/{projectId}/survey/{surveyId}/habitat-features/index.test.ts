import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getSurveyHabitatFeatures, postSurveyHabitatFeatures } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { SurveyHabitatFeaturesWithSupplementaryData } from '../../../../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { SurveyHabitatFeatureService } from '../../../../../../services/habitat-feature-services/survey-habitat-feature-service';

chai.use(sinonChai);

describe('deleteSurveyHabitatFeatures', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('inserts and updates survey habitat features', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const insertSurveyHabitatFeaturesStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'insertSurveyHabitatFeatures')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const surveyHabitatFeatures = [
      {
        habitat_feature_type_id: 1,
        latitude: 48.103322,
        longitude: -122.798892,
        count: 99,
        observed_date: '1970-01-01',
        observed_time: '00:00:00'
      },
      {
        habitat_feature_type_id: 2,
        latitude: 58.103322,
        longitude: -112.798892,
        count: 88,
        observed_date: '2025-01-01',
        observed_time: '12:30:00'
      }
    ];

    mockReq.body = {
      surveyHabitatFeatures
    };

    const requestHandler = postSurveyHabitatFeatures();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(insertSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(2, surveyHabitatFeatures);

    expect(mockRes.status).to.have.been.calledOnceWith(204);
    expect(mockRes.send).to.have.been.calledOnce;

    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.rollback).not.to.have.been.called;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(SurveyHabitatFeatureService.prototype, 'insertSurveyHabitatFeatures').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const surveyHabitatFeatures = [
      {
        habitat_feature_type_id: 1,
        latitude: 48.103322,
        longitude: -122.798892,
        count: 99,
        observed_date: '1970-01-01',
        observed_time: '00:00:00'
      },
      {
        habitat_feature_type_id: 2,
        latitude: 58.103322,
        longitude: -112.798892,
        count: 88,
        observed_date: '2025-01-01',
        observed_time: '12:30:00'
      }
    ];

    mockReq.body = {
      surveyHabitatFeatures
    };

    const requestHandler = postSurveyHabitatFeatures();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('a test error');

      expect(dbConnectionObj.open).to.have.been.called;
      expect(dbConnectionObj.commit).not.to.have.been.called;
      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    }
  });
});

describe('getSurveyHabitatFeatures', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('retrieves survey habitat features with pagination', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockResponse: SurveyHabitatFeaturesWithSupplementaryData = {
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      }
    };

    const getSurveyHabitatFeaturesWithSupplementaryDataStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesWithSupplementaryData')
      .resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.query = {
      page: '4',
      limit: '10',
      sort: 'count',
      order: 'asc'
    };

    const requestHandler = getSurveyHabitatFeatures();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyHabitatFeaturesWithSupplementaryDataStub).to.have.been.calledOnceWith(2, {
      page: 4,
      limit: 10,
      sort: 'count',
      order: 'asc'
    });
    expect(mockRes.status).to.have.been.calledOnceWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith({
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      },
      pagination: {
        total: 59,
        per_page: 10,
        current_page: 4,
        last_page: 6,
        order: 'asc',
        sort: 'count'
      }
    });

    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.rollback).not.to.have.been.called;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
  });

  it('retrieves survey habitat features with some pagination options', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockResponse: SurveyHabitatFeaturesWithSupplementaryData = {
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      }
    };

    const getSurveyHabitatFeaturesWithSupplementaryDataStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesWithSupplementaryData')
      .resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.query = {
      page: '4',
      limit: '10'
    };

    const requestHandler = getSurveyHabitatFeatures();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyHabitatFeaturesWithSupplementaryDataStub).to.have.been.calledOnceWith(2, {
      page: 4,
      limit: 10,
      sort: undefined,
      order: undefined
    });
    expect(mockRes.status).to.have.been.calledOnceWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith({
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      },
      pagination: {
        total: 59,
        per_page: 10,
        current_page: 4,
        last_page: 6,
        order: undefined,
        sort: undefined
      }
    });

    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.rollback).not.to.have.been.called;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
  });

  it('retrieves survey habitat features with no pagination', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockResponse: SurveyHabitatFeaturesWithSupplementaryData = {
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      }
    };

    const getSurveyHabitatFeaturesWithSupplementaryDataStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesWithSupplementaryData')
      .resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyHabitatFeatures();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyHabitatFeaturesWithSupplementaryDataStub).to.have.been.calledOnceWith(2, undefined);
    expect(mockRes.status).to.have.been.calledOnceWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith({
      surveyHabitatFeatures: [
        {
          survey_habitat_feature_id: 1,
          survey_id: 1,
          habitat_feature_type_id: 1,
          latitude: 48.103322,
          longitude: -122.798892,
          count: 99,
          observed_date: '1970-01-01',
          observed_time: '00:00:00',
          survey_sample_period_id: 7,
          survey_sample_period_start_datetime: '2024-12-01T08:00:00Z',
          survey_sample_site_id: 8,
          survey_sample_site_name: 'site',
          method_technique_id: 9,
          method_technique_name: 'technique',
          survey_habitat_feature_taxons: [
            {
              survey_habitat_feature_taxon_id: 1,
              survey_habitat_feature_id: 1,
              itis_tsn: 123,
              itis_scientific_name: 'alces',
              comment: 'comment'
            }
          ]
        },
        {
          survey_habitat_feature_id: 2,
          survey_id: 1,
          habitat_feature_type_id: 2,
          latitude: 58.103322,
          longitude: -112.798892,
          count: 88,
          observed_date: '2025-01-01',
          observed_time: '12:30:00',
          survey_sample_period_id: null,
          survey_sample_period_start_datetime: null,
          survey_sample_site_id: null,
          survey_sample_site_name: null,
          method_technique_id: null,
          method_technique_name: null,
          survey_habitat_feature_taxons: []
        }
      ],
      supplementaryData: {
        count: 59,
        sampling_periods: [],
        habitatFeatureQuantitativeDefinitions: [],
        habitatFeatureQualitativeDefinitions: []
      },
      pagination: {
        total: 59,
        per_page: 59,
        current_page: 1,
        last_page: 1,
        order: undefined,
        sort: undefined
      }
    });

    expect(dbConnectionObj.open).to.have.been.calledOnce;
    expect(dbConnectionObj.commit).to.have.been.calledOnce;
    expect(dbConnectionObj.rollback).not.to.have.been.called;
    expect(dbConnectionObj.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesWithSupplementaryData')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyHabitatFeatures();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect((error as HTTPError).message).to.equal('a test error');

      expect(dbConnectionObj.open).to.have.been.calledOnce;
      expect(dbConnectionObj.commit).not.to.have.been.called;
      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;
    }
  });
});
