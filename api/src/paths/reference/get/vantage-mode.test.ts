import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { VantageModeService } from '../../../services/vantage-mode-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { getVantageModes } from './vantage-mode';

chai.use(sinonChai);

describe('getVantageModes', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return vantage modes for method lookup ids', async () => {
    const mockVantageModeResponse = [
      { vantage_mode_id: 1, vantage_id: 101, name: 'Mode A', description: 'Description for Mode A' },
      { vantage_mode_id: 2, vantage_id: 102, name: 'Mode B', description: 'Description for Mode B' }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getVantageModesByMethodLookupIdsStub = sinon
      .stub(VantageModeService.prototype, 'getVantageModesByMethodLookupIds')
      .resolves(mockVantageModeResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { methodLookupId: ['1', '2'] };

    const requestHandler = getVantageModes();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getVantageModesByMethodLookupIdsStub).to.have.been.calledOnceWith([1, 2]);
    expect(mockRes.jsonValue).to.eql(mockVantageModeResponse);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('should catch and handle errors', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      rollback: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getVantageModesByMethodLookupIdsStub = sinon
      .stub(VantageModeService.prototype, 'getVantageModesByMethodLookupIds')
      .rejects(new Error('Test database error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { methodLookupId: ['1', '2'] };

    const requestHandler = getVantageModes();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected method to throw');
    } catch (error) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(getVantageModesByMethodLookupIdsStub).to.have.been.calledOnceWith([1, 2]);
      expect((error as HTTPError).message).to.equal('Test database error');
    }
  });
});
