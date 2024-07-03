import { expect } from 'chai';
import sinon from 'sinon';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { getCollarVendors } from './vendors';
import { BctwDeviceService } from '../../services/bctw-service/bctw-device-service';

describe('getCollarVendors', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets collar vendors', async () => {
    const mockVendors = ['vendor1', 'vendor2'];
    const mockGetCollarVendors = sinon.stub(BctwDeviceService.prototype, 'getCollarVendors').resolves(mockVendors);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
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
