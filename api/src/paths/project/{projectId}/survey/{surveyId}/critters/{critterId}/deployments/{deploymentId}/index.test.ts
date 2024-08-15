import { expect } from 'chai';
import sinon from 'sinon';
import { updateDeployment } from '.';
import * as db from '../../../../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../../../../services/bctw-service/bctw-deployment-service';
import { CritterbaseService, ICapture } from '../../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../../__mocks__/db';

describe('updateDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockCapture: ICapture = {
      capture_id: '111',
      critter_id: '222',
      capture_method_id: null,
      capture_location_id: '333',
      release_location_id: null,
      capture_date: '2021-01-01',
      capture_time: '12:00:00',
      release_date: null,
      release_time: null,
      capture_comment: null,
      release_comment: null
    };

    const updateDeploymentStub = sinon.stub(DeploymentService.prototype, 'updateDeployment').resolves();
    const updateBctwDeploymentStub = sinon.stub(BctwDeploymentService.prototype, 'updateDeployment');
    const getCaptureByIdStub = sinon.stub(CritterbaseService.prototype, 'getCaptureById').resolves(mockCapture);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = updateDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(updateDeploymentStub).to.have.been.calledOnce;
    expect(updateBctwDeploymentStub).to.have.been.calledOnce;
    expect(getCaptureByIdStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const updateDeploymentStub = sinon.stub(DeploymentService.prototype, 'updateDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = updateDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(updateDeploymentStub).to.have.been.calledOnce;
    }
  });
});
