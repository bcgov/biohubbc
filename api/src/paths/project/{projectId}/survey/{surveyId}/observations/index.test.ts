import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationRecordWithSamplingAndSubcountData } from '../../../../../../repositories/observation-repository/observation-repository';
import { CritterbaseService } from '../../../../../../services/critterbase-service';
import { ObservationService } from '../../../../../../services/observation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as observationRecords from './index';

chai.use(sinonChai);

describe('insertUpdateManualSurveyObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('inserts and updates survey observations', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const validateSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'validateSurveyObservations')
      .resolves(true);

    const insertUpdateSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'insertUpdateManualSurveyObservations')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const surveyObservations = [
      {
        standardColumns: {
          survey_observation_id: 1,
          itis_tsn: 1234,
          itis_scientific_name: '',
          count: 99,
          latitude: 48.103322,
          longitude: -122.798892,
          observation_date: '1970-01-01',
          observation_time: '00:00:00',
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        },
        subcounts: []
      },
      {
        standardColumns: {
          itis_tsn: 1234,
          itis_scientific_name: '',
          count: 99,
          latitude: 48.103322,
          longitude: -122.798892,
          observation_date: '1970-01-01',
          observation_time: '00:00:00',
          survey_sample_site_id: 1,
          survey_sample_method_id: 1,
          survey_sample_period_id: 1
        },
        subcounts: []
      }
    ];

    mockReq.body = {
      surveyObservations
    };

    const requestHandler = observationRecords.insertUpdateManualSurveyObservations();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(validateSurveyObservationsStub).to.have.been.calledOnceWith(
      surveyObservations,
      sinon.match.instanceOf(CritterbaseService)
    );
    expect(insertUpdateSurveyObservationsStub).to.have.been.calledOnceWith(2, surveyObservations);
    expect(mockRes.statusValue).to.equal(204);
    expect(mockRes.jsonValue).to.eql(undefined);
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(ObservationService.prototype, 'validateSurveyObservations').resolves(true);

    sinon.stub(ObservationService.prototype, 'insertUpdateManualSurveyObservations').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      surveyObservations: [
        {
          standardColumns: {
            itis_tsn: 1234,
            itis_scientific_name: 'scientific name',
            count: 99,
            latitude: 48.103322,
            longitude: -122.798892,
            observation_date: '1970-01-01',
            observation_time: '00:00:00',
            subcount: 1,
            survey_sample_period_id: 1,
            survey_sample_method_id: 1,
            survey_sample_site_id: 1
          },
          subcounts: []
        }
      ]
    };

    try {
      const requestHandler = observationRecords.insertUpdateManualSurveyObservations();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});

describe('getSurveyObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('retrieves survey observations with pagination', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData')
      .resolves({
        surveyObservations: [
          { survey_observation_id: 11 },
          { survey_observation_id: 12 }
        ] as unknown as ObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 59,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: []
        }
      });

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

    const requestHandler = observationRecords.getSurveyObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyObservationsStub).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 11 }, { survey_observation_id: 12 }],
      supplementaryObservationData: {
        observationCount: 59,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: []
      },
      pagination: {
        total: 59,
        current_page: 4,
        last_page: 6,
        order: 'asc',
        per_page: 10,
        sort: 'count'
      }
    });
  });

  it('retrieves survey observations with some pagination options', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData')
      .resolves({
        surveyObservations: [
          { survey_observation_id: 16 },
          { survey_observation_id: 17 }
        ] as unknown as ObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 50,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: []
        }
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.query = {
      page: '2',
      limit: '15'
    };

    const requestHandler = observationRecords.getSurveyObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyObservationsStub).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 16 }, { survey_observation_id: 17 }],
      supplementaryObservationData: {
        observationCount: 50,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: []
      },
      pagination: {
        total: 50,
        current_page: 2,
        last_page: 4,
        order: undefined,
        per_page: 15,
        sort: undefined
      }
    });
  });

  it('retrieves survey observations with no pagination', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData')
      .resolves({
        surveyObservations: [
          { survey_observation_id: 16 },
          { survey_observation_id: 17 }
        ] as unknown as ObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 2,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: []
        }
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = observationRecords.getSurveyObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(getSurveyObservationsStub).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 16 }, { survey_observation_id: 17 }],
      supplementaryObservationData: {
        observationCount: 2,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: []
      },
      pagination: {
        total: 2,
        current_page: 1,
        last_page: 1,
        per_page: 2,
        order: undefined,
        sort: undefined
      }
    });
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsWithSupplementaryAndSamplingDataAndAttributeData')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    try {
      const requestHandler = observationRecords.getSurveyObservations();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
