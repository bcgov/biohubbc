import { expect } from 'chai';
import sinon from 'sinon';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { SystemUser } from '../../repositories/user-repository';
import { BctwDeviceService } from '../../services/bctw-service/bctw-device-service';
import { getCollarVendors } from './vendors';

describe('getCollarVendors', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets collar vendors', async () => {
    const mockVendors = ['vendor1', 'vendor2'];
    const mockGetCollarVendors = sinon.stub(BctwDeviceService.prototype, 'getCollarVendors').resolves(mockVendors);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getCollarVendors();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockVendors);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetCollarVendors).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockError = new Error('a test error');

    const mockGetCollarVendors = sinon.stub(BctwDeviceService.prototype, 'getCollarVendors').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getCollarVendors();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCollarVendors).to.have.been.calledOnce;
    }
  });
});
