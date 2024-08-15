import { expect } from 'chai';
import sinon from 'sinon';
import { deleteDeployment } from '.';
import * as db from '../../../../../../../database/db';
import { BctwDeploymentService } from '../../../../../../../services/bctw-service/bctw-deployment-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../../../../../__mocks__/db';

describe('deleteDeployment', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes an existing deployment', async () => {
    const mockDBConnection = getMockDBConnection({ release: sinon.stub() });

    const mockGetDBConnection = sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    const mockRemoveDeployment = sinon.stub(DeploymentService.prototype, 'deleteDeployment').resolves();
    const mockBctwService = sinon.stub(BctwDeploymentService.prototype, 'deleteDeployment');

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = deleteDeployment();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetDBConnection).to.have.been.calledOnce;
    expect(mockRemoveDeployment).to.have.been.calledOnce;
    expect(mockBctwService).to.have.been.calledOnce;
    expect(mockRes.status).to.have.been.calledWith(200);
  });
});
