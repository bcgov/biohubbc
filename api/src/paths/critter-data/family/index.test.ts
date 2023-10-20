import { expect } from 'chai';
import sinon from 'sinon';
import { getFamilies } from '.';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';

describe('getFamilies', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets families', async () => {
    const mockFamilies = ['family1', 'family2'];
    const mockGetFamilies = sinon.stub(CritterbaseService.prototype, 'getFamilies').resolves(mockFamilies);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getFamilies();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetFamilies.calledOnce).to.be.true;
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.json.calledWith(mockFamilies)).to.be.true;
  });

  it('handles error', async () => {
    const mockError = new Error('mock error');
    const mockGetFamilies = sinon.stub(CritterbaseService.prototype, 'getFamilies').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getFamilies();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetFamilies.calledOnce).to.be.true;
    }
  });
});
