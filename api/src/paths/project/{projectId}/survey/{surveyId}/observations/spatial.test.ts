import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import {
  ObservationCountSupplementaryData,
  ObservationGeometryRecord
} from '../../../../../../repositories/observation-repository/observation-repository.interface';
import { ObservationService } from '../../../../../../services/observation-services/observation-service';
import { getSurveyObservationsGeometry } from './spatial';

chai.use(sinonChai);

describe('getSurveyObservationsGeometry', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('retrieves survey observations with pagination', async () => {
    const dbConnectionObj = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const mockResponse: {
      surveyObservationsGeometry: ObservationGeometryRecord[];
      supplementaryObservationData: ObservationCountSupplementaryData;
    } = {
      surveyObservationsGeometry: [
        {
          survey_observation_id: 11,
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5]
          }
        },
        {
          survey_observation_id: 12,
          geometry: {
            type: 'Point',
            coordinates: [102.0, 0.5]
          }
        }
      ],
      supplementaryObservationData: {
        observationCount: 2
      }
    };

    const getSurveyObservationsStub = sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsGeometryWithSupplementaryData')
      .resolves(mockResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyObservationsGeometry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(dbConnectionObj.open).to.have.been.calledOnce;

    expect(getSurveyObservationsStub).to.have.been.calledOnceWith(2);

    expect(dbConnectionObj.commit).to.have.been.calledOnce;

    expect(mockRes.json).to.have.been.calledOnceWith(mockResponse);
    expect(mockRes.status).to.have.been.calledOnceWith(200);

    expect(dbConnectionObj.release).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const dbConnectionObj = getMockDBConnection({ open: sinon.stub(), rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon
      .stub(ObservationService.prototype, 'getSurveyObservationsGeometryWithSupplementaryData')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const requestHandler = getSurveyObservationsGeometry();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(dbConnectionObj.open).to.have.been.calledOnce;

      expect(dbConnectionObj.rollback).to.have.been.calledOnce;
      expect(dbConnectionObj.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
