import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getCollectionUnitsByCategory } from './collection-units';

describe('getCollectionUnits', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets taxon collection categories', async () => {
    const mockCollectionUnits = ['unit1', 'unit2'];
    const mockGetCollectionUnits = sinon
      .stub(CritterbaseService.prototype, 'getCollectionUnits')
      .resolves(mockCollectionUnits);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getCollectionUnitsByCategory();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetCollectionUnits.calledOnce).to.be.true;
    expect(mockRes.status.calledOnceWith(200)).to.be.true;
    expect(mockRes.json.calledOnceWith(mockCollectionUnits)).to.be.true;
  });

  it('handles errors', async () => {
    const mockError = new Error('mock error');
    const mockGetCollectionUnits = sinon.stub(CritterbaseService.prototype, 'getCollectionUnits').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getCollectionUnitsByCategory();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetCollectionUnits.calledOnce).to.be.true;
    }
  });
});
