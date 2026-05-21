import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../__mocks__/db';
import { dbDependencies as db } from '../../../../../../database/db';
import { ApiError } from '../../../../../../errors/api-error';
import { HTTPError } from '../../../../../../errors/http-error';
import { TechniqueRepository } from '../../../../../../repositories/technique-repository';
import { AttractantService } from '../../../../../../services/attractants-service';
import { SamplePeriodService } from '../../../../../../services/sample-period-service';
import { TechniqueAttributeService } from '../../../../../../services/technique-attributes-service';
import { TechniqueService } from '../../../../../../services/technique-service';
import { TechniqueVantageService } from '../../../../../../services/technique-vantage-service';
import { deleteSurveyTechniqueRecords } from './delete';

chai.use(sinonChai);

describe('deleteSurveyTechniqueRecords', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteTechniquesStub = sinon
      .stub(TechniqueService.prototype, 'deleteTechniques')
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
      expect((actualError as HTTPError).message).to.equal('a test error');

      expect(deleteTechniquesStub).to.have.been.calledOnce;

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });

  it('throws an error if any technique records are associated to a survey sampling period record', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2'
    };

    mockReq.body = {
      methodTechniqueIds: [1, 2, 3]
    };

    sinon
      .stub(SamplePeriodService.prototype, 'findSamplePeriodsCount')
      .onCall(0)
      .resolves(0)
      .onCall(1)
      .resolves(4) // Technique ID=2 is associated to four survey sample period records
      .onCall(2)
      .resolves(0);

    sinon.stub(AttractantService.prototype, 'deleteAllTechniqueAttractants').resolves();
    sinon.stub(TechniqueAttributeService.prototype, 'deleteAllTechniqueAttributes').resolves();
    sinon.stub(TechniqueVantageService.prototype, 'deleteAllVantagesForTechnique').resolves();
    sinon.stub(TechniqueRepository.prototype, 'deleteTechnique').resolves();

    const requestHandler = deleteSurveyTechniqueRecords();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).instanceOf(ApiError);
      expect((actualError as ApiError).message).to.equal(
        'Cannot delete a technique that is associated to a survey sample period.'
      );

      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
    }
  });

  it('should delete technique records', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const deleteTechniquesStub = sinon.stub(TechniqueService.prototype, 'deleteTechniques').resolves();

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

    expect(mockRes.status).to.have.been.calledWith(204);

    expect(deleteTechniquesStub).to.have.been.calledOnce;

    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });
});
