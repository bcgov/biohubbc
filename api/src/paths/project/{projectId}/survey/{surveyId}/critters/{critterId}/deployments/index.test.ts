import { expect } from 'chai';
import sinon from 'sinon';
import { createDeployment } from '.';
import * as db from '../../../../../../../../database/db';
import {
  BctwDeploymentRecord,
  BctwDeploymentService
} from '../../../../../../../../services/bctw-service/bctw-deployment-service';
import { CritterbaseService, ICapture } from '../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';

describe('createDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a new deployment', async () => {
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

    const mockDeployment: BctwDeploymentRecord = {
      assignment_id: '111',
      collar_id: '222',
      critter_id: '333',
      created_at: '2021-01-01',
      created_by_user_id: '444',
      updated_at: '2021-01-01',
      updated_by_user_id: '555',
      valid_from: '2021-01-01',
      valid_to: '2021-01-01',
      attachment_start: '2021-01-01',
      attachment_end: '2021-01-01',
      deployment_id: '666',
      device_id: 777
    };

    const insertDeploymentStub = sinon.stub(DeploymentService.prototype, 'insertDeployment').resolves();
    const createDeploymentStub = sinon
      .stub(BctwDeploymentService.prototype, 'createDeployment')
      .resolves(mockDeployment);
    const getCaptureByIdStub = sinon.stub(CritterbaseService.prototype, 'getCaptureById').resolves(mockCapture);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = createDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(insertDeploymentStub).to.have.been.calledOnce;
    expect(createDeploymentStub).to.have.been.calledOnce;
    expect(getCaptureByIdStub).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(201);
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const insertDeploymentStub = sinon.stub(DeploymentService.prototype, 'insertDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = createDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetDBConnection).to.have.been.calledOnce;
      expect(insertDeploymentStub).to.have.been.calledOnce;
    }
  });
});
