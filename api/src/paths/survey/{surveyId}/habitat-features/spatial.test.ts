import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SurveyHabitatFeaturesGeometryWithSupplementaryData } from '../../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { SurveyHabitatFeatureService } from '../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { getSurveyHabitatFeaturesGeometry } from './spatial';

chai.use(sinonChai);

describe('getSurveyHabitatFeaturesGeometry', () => {
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

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const getSurveyHabitatFeaturesGeometryStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesGeometry')
      .rejects(new Error('a test error'));

    try {
      const requestHandler = getSurveyHabitatFeaturesGeometry();
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(getSurveyHabitatFeaturesGeometryStub).to.have.been.calledOnceWith(2);

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('should return survey habitat features spatial data on success', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    const surveyHabitatFeaturesGeometryMock: SurveyHabitatFeaturesGeometryWithSupplementaryData = {
      surveyHabitatFeaturesGeometry: [
        {
          survey_habitat_feature_id: 1,
          geometry: { type: 'Point', coordinates: [0, 0] }
        },
        {
          survey_habitat_feature_id: 2,
          geometry: { type: 'Point', coordinates: [1, 1] }
        }
      ],
      supplementaryData: {
        count: 59
      }
    };

    const getSurveyHabitatFeaturesGeometryStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'getSurveyHabitatFeaturesGeometry')
      .resolves(surveyHabitatFeaturesGeometryMock);

    const requestHandler = getSurveyHabitatFeaturesGeometry();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(getSurveyHabitatFeaturesGeometryStub).to.have.been.calledOnceWith(2);

    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledOnceWith(200);
    expect(mockRes.json).to.have.been.calledOnceWith(surveyHabitatFeaturesGeometryMock);

    expect(mockDBConnection.rollback).not.to.have.been.called;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
