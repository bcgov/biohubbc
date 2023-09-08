import { expect } from 'chai';
import sinon from 'sinon';
import { CritterbaseService } from '../../../services/critterbase-service';
import { getRequestHandlerMocks } from '../../../__mocks__/db';
import { filterCritters } from './filter';

describe('filterCritters', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns a list of critters', async () => {
    const mockCritters = ['critter1', 'critter2'];
    const mockFilterCritters = sinon.stub(CritterbaseService.prototype, 'filterCritters').resolves(mockCritters);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = filterCritters();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.status).to.have.been.calledWith(200);
    expect(mockRes.json).to.have.been.calledWith(mockCritters);
    expect(mockFilterCritters).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockError = new Error('a test error');

    const mockFilterCritters = sinon.stub(CritterbaseService.prototype, 'filterCritters').rejects(mockError);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    const requestHandler = filterCritters();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(actualError).to.equal(mockError);
      expect(mockFilterCritters).to.have.been.calledOnce;
    }
  });
});
