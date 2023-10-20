import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getTaxonMeasurements } from './taxon-measurements';

describe('getTaxonMeasurements', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets taxon measurements', async () => {
    const mockTaxonMeasurements = ['measurement1', 'measurement2'];
    const mockGetTaxonMeasurements = sinon
      .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
      .resolves(mockTaxonMeasurements);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonMeasurements();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetTaxonMeasurements.calledOnce).to.be.true;
    expect(mockRes.statusValue).to.equal(200);
    expect(mockRes.json.calledWith(mockTaxonMeasurements)).to.be.true;
  });

  it('handles errors', async () => {
    const mockError = new Error('mock error');
    const mockGetTaxonMeasurements = sinon
      .stub(CritterbaseService.prototype, 'getTaxonMeasurements')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getTaxonMeasurements();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetTaxonMeasurements.calledOnce).to.be.true;
    }
  });
});
