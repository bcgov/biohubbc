import { expect } from 'chai';
import sinon from 'sinon';
import * as db from '../../../../../../../database/db';
import { BctwService } from '../../../../../../../services/bctw-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';
import { deployDevice } from './deployments';

describe('deployDevice', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
  const mockSurveyEntry = 123;

  it('deploys a new telemetry device', async () => {
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').resolves(mockSurveyEntry);
    const mockBctwService = sinon.stub(BctwService.prototype, 'deployDevice');

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = deployDevice();
    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection.calledOnce).to.be.true;
    expect(mockAddDeployment.calledOnce).to.be.true;
    expect(mockBctwService.calledOnce).to.be.true;
    expect(mockRes.status).to.have.been.calledWith(201);
    expect(mockRes.json).to.have.been.calledWith(mockSurveyEntry);
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('a test error');
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockAddDeployment = sinon.stub(SurveyCritterService.prototype, 'upsertDeployment').rejects(mockError);
    const mockBctwService = sinon.stub(BctwService.prototype, 'deployDevice');

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = deployDevice();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockGetDBConnection.calledOnce).to.be.true;
      expect(mockAddDeployment.calledOnce).to.be.true;
      expect(mockBctwService.notCalled).to.be.true;
    }
  });
});
