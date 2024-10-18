import { expect } from 'chai';
import sinon from 'sinon';
import { createDeployment } from '.';
import * as db from '../../../../../../../../database/db';
import { DeploymentService } from '../../../../../../../../services/deployment-services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../../__mocks__/db';

describe('createDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a new deployment', async () => {
    const mockDBConnection = getMockDBConnection({ commit: sinon.stub(), release: sinon.stub() });
    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(DeploymentService.prototype, 'createDeployment').resolves();

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.params = {
      projectId: '1',
      surveyId: '2',
      critterId: '3'
    };
    mockReq.body = {
      device_id: 4,
      frequency: 100,
      frequency_unit_id: 1,
      attachmentStartDard: '2021-01-01',
      attachmentStartTime: '00:00',
      attachmentEndDate: '2021-01-02',
      attachmentEndTime: '00:00',
      critterbaseStartCaptureId: '123-456-789',
      critterbaseEndCaptureId: null,
      critterbaseEndMortalityId: null
    };

    const requestHandler = createDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });
    const getDBConnectionStub = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const mockError = new Error('a test error');
    const insertDeploymentStub = sinon.stub(DeploymentService.prototype, 'createDeployment').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = createDeployment();
    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(getDBConnectionStub).to.have.been.calledOnce;
      expect(insertDeploymentStub).to.have.been.calledOnce;
    }
  });
});
