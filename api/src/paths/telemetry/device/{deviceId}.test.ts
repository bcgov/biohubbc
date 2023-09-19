import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import { BctwService } from '../../../services/bctw-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { GET, getDeviceDetails } from './{deviceId}';

describe('getDeviceDetails', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema((GET.apiDoc as unknown) as object)).to.be.true;
    });
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
