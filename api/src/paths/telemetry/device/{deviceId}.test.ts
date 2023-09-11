import { expect } from 'chai';
import sinon from 'sinon';
import { BctwService } from '../../../services/bctw-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getDeviceDetails } from './{deviceId}';

describe('getDeviceDetails', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets device details', async () => {
    const mockGetDeviceDetails = sinon.stub(BctwService.prototype, 'getDeviceDetails').resolves([]);
    const mockGetDeployments = sinon.stub(BctwService.prototype, 'getDeviceDeployments').resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getDeviceDetails();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetDeviceDetails).to.have.been.calledOnce;
    expect(mockGetDeployments).to.have.been.calledOnce;
  });
});
