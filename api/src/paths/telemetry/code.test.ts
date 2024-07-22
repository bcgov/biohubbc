import { expect } from 'chai';
import sinon from 'sinon';
import { SystemUser } from '../../repositories/user-repository';
import { BctwService } from '../../services/bctw-service';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { getCodeValues } from './code';

describe('getCodeValues', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns a list of Bctw code objects', async () => {
    const mockCodeValues = [
      {
        code_header_title: 'title',
        code_header_name: 'name',
        id: 123,
        code: 'code',
        description: 'description',
        long_description: 'long_description'
      }
    ];
    const mockGetCode = sinon.stub(BctwService.prototype, 'getCode').resolves(mockCodeValues);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getCodeValues();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockCodeValues);
    expect(mockRes.statusValue).to.equal(200);
    expect(mockGetCode).to.have.been.calledOnce;
  });

  it('catches and re-throws errors', async () => {
    const mockError = new Error('mock error');
    const mockGetCode = sinon.stub(BctwService.prototype, 'getCode').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.system_user = { user_identifier: 'user', user_guid: 'guid' } as SystemUser;

    const requestHandler = getCodeValues();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCode).to.have.been.calledOnce;
    }
  });
});
