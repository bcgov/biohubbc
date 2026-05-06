import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import * as db from '../../../../../../../database/db';
import { HTTPError } from '../../../../../../../errors/http-error';
import { FlattenedObservationRecordWithSamplingAndSubcountData } from '../../../../../../../repositories/observation-repository/observation-repository.interface';
import { ObservationService } from '../../../../../../../services/observation-services/observation-service';
import { getSurveyFlattenedObservations } from './index';

chai.use(sinonChai);

describe('getSurveyObservations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('retrieves survey observations with pagination', async () => {
    const dbConnectionObj = getMockDBConnection();

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub = sinon
      .stub(
        ObservationService.prototype,
        'getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeData'
      )
      .resolves({
        surveyObservations: [
          { survey_observation_id: 11 },
          { survey_observation_id: 12 }
        ] as unknown as FlattenedObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 59,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: [],
          sampling_data: []
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

    const requestHandler = getSurveyFlattenedObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(
      getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub
    ).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 11 }, { survey_observation_id: 12 }],
      supplementaryObservationData: {
        observationCount: 59,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: [],
        sampling_data: []
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

    const getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub = sinon
      .stub(
        ObservationService.prototype,
        'getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeData'
      )
      .resolves({
        surveyObservations: [
          { survey_observation_id: 16 },
          { survey_observation_id: 17 }
        ] as unknown as FlattenedObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 50,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: [],
          sampling_data: []
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

    const requestHandler = getSurveyFlattenedObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(
      getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub
    ).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 16 }, { survey_observation_id: 17 }],
      supplementaryObservationData: {
        observationCount: 50,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: [],
        sampling_data: []
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

    const getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub = sinon
      .stub(
        ObservationService.prototype,
        'getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeData'
      )
      .resolves({
        surveyObservations: [
          { survey_observation_id: 16 },
          { survey_observation_id: 17 }
        ] as unknown as FlattenedObservationRecordWithSamplingAndSubcountData[],
        supplementaryObservationData: {
          observationCount: 2,
          qualitative_measurements: [],
          quantitative_measurements: [],
          qualitative_environments: [],
          quantitative_environments: [],
          sampling_data: []
        }
      });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyFlattenedObservations();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(
      getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeDataStub
    ).to.have.been.calledOnceWith(2);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.jsonValue).to.eql({
      surveyObservations: [{ survey_observation_id: 16 }, { survey_observation_id: 17 }],
      supplementaryObservationData: {
        observationCount: 2,
        qualitative_measurements: [],
        quantitative_measurements: [],
        qualitative_environments: [],
        quantitative_environments: [],
        sampling_data: []
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
      .stub(
        ObservationService.prototype,
        'getSurveyFlattenedObservationsWithSupplementaryAndSamplingDataAndAttributeData'
      )
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    try {
      const requestHandler = getSurveyFlattenedObservations();

      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.release).to.have.been.called;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
