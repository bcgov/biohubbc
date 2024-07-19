import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../../../../database/db';
import { HTTPError } from '../../../../../../errors/http-error';
import { ObservationService } from '../../../../../../services/observation-service';
import { TechniqueService } from '../../../../../../services/technique-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { deleteSurveyTechniqueRecords } from './delete';

chai.use(sinonChai);

describe('deleteSurveyTechniqueRecords', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(0);

    const deleteTechniqueStub = sinon
      .stub(TechniqueService.prototype, 'deleteTechnique')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      methodTechniqueIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyTechniqueRecords();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnce;
      expect(deleteTechniqueStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });

  it('throws an error if any technique records are associated to an observation record', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(10); // technique records are associated to 10 observation records

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      methodTechniqueIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyTechniqueRecords();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal(
        'Cannot delete a technique that is associated with an observation'
      );
      expect((actualError as HTTPError).status).to.equal(409);
    }
  });

  it('should delete technique records', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getObservationsCountByTechniqueIdsStub = sinon
      .stub(ObservationService.prototype, 'getObservationsCountByTechniqueIds')
      .resolves(0);

    const deleteTechniqueStub = sinon.stub(TechniqueService.prototype, 'deleteTechnique').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      methodTechniqueIds: [1, 2, 3]
    };

    const requestHandler = deleteSurveyTechniqueRecords();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getObservationsCountByTechniqueIdsStub).to.have.been.calledOnce;
    expect(deleteTechniqueStub).to.have.been.calledThrice;

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;

    expect(mockRes.status).to.have.been.calledWith(204);
  });
});
