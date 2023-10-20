import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getFamilyById } from './{familyId}';

describe('getFamilyById', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets a family by id', async () => {
    const mockFamily = { id: '1', name: 'family1' };
    const mockGetFamilyById = sinon.stub(CritterbaseService.prototype, 'getFamilyById').resolves(mockFamily);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getFamilyById();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetFamilyById.calledOnce).to.be.true;
    expect(mockRes.json.calledOnce).to.be.true;
    expect(mockRes.json.args[0][0]).to.deep.equal(mockFamily);
  });

  it('handles errors', async () => {
    const mockError = new Error('error');
    const mockGetFamilyById = sinon.stub(CritterbaseService.prototype, 'getFamilyById').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getFamilyById();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetFamilyById.calledOnce).to.be.true;
    }
  });
});
