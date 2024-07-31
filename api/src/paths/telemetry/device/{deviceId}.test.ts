import Ajv from 'ajv';
import { expect } from 'chai';
import sinon from 'sinon';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { SystemUser } from '../../../repositories/user-repository';
import { BctwDeploymentService } from '../../../services/bctw-service/bctw-deployment-service';
import { BctwDeviceService } from '../../../services/bctw-service/bctw-device-service';
import { BctwKeyxService } from '../../../services/bctw-service/bctw-keyx-service';
import { GET, getDeviceDetails } from './{deviceId}';

describe('getDeviceDetails', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('openapi schema', () => {
    const ajv = new Ajv();

    it('is valid openapi v3 schema', () => {
      expect(ajv.validateSchema(GET.apiDoc as unknown as object)).to.be.true;
    });
  });

  it('gets device details', async () => {
    const mockGetDeviceDetails = sinon.stub(BctwDeviceService.prototype, 'getDeviceDetails').resolves([]);
    const mockGetDeployments = sinon.stub(BctwDeploymentService.prototype, 'getDeploymentsByDeviceId').resolves([]);
    const mockGetKeyXDetails = sinon.stub(BctwKeyxService.prototype, 'getKeyXDetails').resolves([]);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getDeviceDetails();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetDeviceDetails).to.have.been.calledOnce;
    expect(mockGetDeployments).to.have.been.calledOnce;
    expect(mockGetKeyXDetails).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('test error');
    const mockGetDeviceDetails = sinon.stub(BctwDeviceService.prototype, 'getDeviceDetails').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getDeviceDetails();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (error) {
      expect(error).to.equal(mockError);
      expect(mockGetDeviceDetails).to.have.been.calledOnce;
      expect(mockNext).not.to.have.been.called;
    }
  });
});
