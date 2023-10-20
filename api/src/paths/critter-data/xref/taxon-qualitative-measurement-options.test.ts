import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { getQualMeasurementOptions } from './taxon-qualitative-measurement-options';

describe('getQualMeasurementOptions', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets qualitative measurement options', async () => {
    const mockQualMeasurementOptions = ['qualMeasurementOption1', 'qualMeasurementOption2'];
    const mockGetQualMeasurementOptions = sinon
      .stub(CritterbaseService.prototype, 'getQualitativeOptions')
      .resolves(mockQualMeasurementOptions);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getQualMeasurementOptions();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockGetQualMeasurementOptions.calledOnce).to.be.true;
    expect(mockRes.status.calledOnce).to.be.true;
    expect(mockRes.status.getCall(0).args[0]).to.equal(200);
    expect(mockRes.json.calledOnce).to.be.true;
    expect(mockRes.json.getCall(0).args[0]).to.deep.equal(mockQualMeasurementOptions);
  });

  it('handles errors', async () => {
    const mockError = new Error('mockError');
    const mockGetQualMeasurementOptions = sinon
      .stub(CritterbaseService.prototype, 'getQualitativeOptions')
      .rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = getQualMeasurementOptions();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockGetQualMeasurementOptions.calledOnce).to.be.true;
    }
  });
});
