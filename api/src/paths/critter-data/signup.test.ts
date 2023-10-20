import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../__mocks__/db';
import { signUp } from './signup';

describe('signUp', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('adds a user to critterbase and returns status 200', async () => {
    const mockAddUser = sinon.stub(CritterbaseService.prototype, 'signUp').resolves({ message: 'User created' });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = signUp();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockAddUser.calledOnce).to.be.true;
    expect(mockRes.status.calledOnce).to.be.true;
    expect(mockRes.status.args[0][0]).to.equal(200);
    expect(mockRes.json.calledOnce).to.be.true;
    expect(mockRes.json.args[0][0]).to.deep.equal({ message: 'User created' });
  });
  it('catches and re-throws error', async () => {
    const mockError = new Error('mockError');
    const mockAddUser = sinon.stub(CritterbaseService.prototype, 'signUp').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = signUp();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockAddUser.calledOnce).to.be.true;
    }
  });
});
