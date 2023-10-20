import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getTaxonBodyLocations } from './taxon-marking-body-locations';

describe('getTaxonBodyLocations', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets taxon body locations', async () => {
    const mockTaxonBodyLocations = ['bodyLocation1', 'bodyLocation2'];
    const mockGetTaxonBodyLocations = sinon
      .stub(CritterbaseService.prototype, 'getTaxonBodyLocations')
      .resolves(mockTaxonBodyLocations);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonBodyLocations();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetTaxonBodyLocations.calledOnce).to.be.true;
    expect(mockRes.status.calledOnceWith(200)).to.be.true;
    expect(mockRes.json.calledOnceWith(mockTaxonBodyLocations)).to.be.true;
  });

  it('handles errors', async () => {
    const mockError = new Error('mock error');
    const mockGetTaxonBodyLocations = sinon
      .stub(CritterbaseService.prototype, 'getTaxonBodyLocations')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonBodyLocations();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetTaxonBodyLocations.calledOnce).to.be.true;
    }
  });
});
