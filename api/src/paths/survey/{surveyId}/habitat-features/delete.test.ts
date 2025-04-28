import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../database/db';
import { HTTPError } from '../../../../errors/http-error';
import { SurveyHabitatFeatureService } from '../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../__mocks__/db';
import { deleteSurveyHabitatFeatures } from './delete';

chai.use(sinonChai);

describe('deleteSurveyHabitatFeatures', () => {
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

    const deleteSurveyHabitatFeaturesStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'deleteSurveyHabitatFeatures')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      surveyHabitatFeatureIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyHabitatFeatures();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(deleteSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(2, [1, 2, 3]);

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

    const deleteSurveyHabitatFeaturesStub = sinon
      .stub(SurveyHabitatFeatureService.prototype, 'deleteSurveyHabitatFeatures')
      .resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      surveyHabitatFeatureIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyHabitatFeatures();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(deleteSurveyHabitatFeaturesStub).to.have.been.calledOnceWith(2, [1, 2, 3]);

    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(204);

    expect(mockDBConnection.rollback).not.to.have.been.called;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
