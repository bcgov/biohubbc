import { expect } from 'chai';
import sinon from 'sinon';
import { BctwService } from '../../../services/bctw-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { upsertDevice } from './index';

describe('upsertDevice', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('upsert device details', async () => {
    const mockUpsertDevice = sinon.stub(BctwService.prototype, 'updateDevice');

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = upsertDevice();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.statusValue).to.equal(200);
    expect(mockUpsertDevice).to.have.been.calledOnce;
  });
});
