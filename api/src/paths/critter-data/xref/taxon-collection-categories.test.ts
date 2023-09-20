import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getTaxonCollectionCategories } from './taxon-collection-categories';

describe('getTaxonCollectionCategories', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets taxon collection categories', async () => {
    const mockTaxonBodyLocations = ['category1', 'category2'];
    const mockgetTaxonCollectionCategories = sinon
      .stub(CritterbaseService.prototype, 'getTaxonCollectionCategories')
      .resolves(mockTaxonBodyLocations);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonCollectionCategories();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockgetTaxonCollectionCategories.calledOnce).to.be.true;
    expect(mockRes.status.calledOnceWith(200)).to.be.true;
    expect(mockRes.json.calledOnceWith(mockTaxonBodyLocations)).to.be.true;
  });

  it('handles errors', async () => {
    const mockError = new Error('mock error');
    const mockgetTaxonCollectionCategories = sinon
      .stub(CritterbaseService.prototype, 'getTaxonCollectionCategories')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonCollectionCategories();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockgetTaxonCollectionCategories.calledOnce).to.be.true;
    }
  });
});
