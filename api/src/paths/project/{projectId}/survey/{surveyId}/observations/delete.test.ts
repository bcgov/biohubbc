import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../services/observation-services/observation-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { deleteSurveyObservations } from './delete';

chai.use(sinonChai);

describe('deleteSurveyObservations', () => {
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

    const deleteObservationsByIdsStub = sinon
      .stub(ObservationService.prototype, 'deleteObservationsByIds')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      surveyObservationIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyObservations();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;

      expect(deleteObservationsByIdsStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('should delete observation records', async () => {
    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteObservationsByIdsStub = sinon.stub(ObservationService.prototype, 'deleteObservationsByIds').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      surveyObservationIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyObservations();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;

    expect(deleteObservationsByIdsStub).to.have.been.calledOnce;

    expect(mockDBConnection.commit).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(204);

    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
