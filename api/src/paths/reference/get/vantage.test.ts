import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../../database/db';
import { HTTPError } from '../../../errors/http-error';
import { VantageService } from '../../../services/vantage-mode-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../../__mocks__/db';
import { getVantageReferenceRecords } from './vantage';

chai.use(sinonChai);

describe('getVantages', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should return vantages for method lookup ids', async () => {
    const mockVantageResponse = [
      {
        vantage_category_id: 101,
        name: 'Vantage A',
        description: 'Description for vantage A',
        vantages: [{ vantage_method_id: 1, name: 'Mode A', description: 'Description' }]
      },
      {
        vantage_category_id: 102,
        name: 'Vantage B',
        description: 'Description for vantage B',
        vantages: [
          { vantage_method_id: 2, name: 'Mode B', description: 'Description' },
          { vantage_method_id: 3, name: 'Mode C', description: 'Description' }
        ]
      }
    ];

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub()
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getVantageReferenceRecordsByMethodLookupIdsStub = sinon
      .stub(VantageService.prototype, 'getVantageReferenceRecordsByMethodLookupIds')
      .resolves(mockVantageResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { methodLookupId: ['1', '2'] };

    const requestHandler = getVantageReferenceRecords();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(getVantageReferenceRecordsByMethodLookupIdsStub).to.have.been.calledOnceWith([1, 2]);
    expect(mockRes.jsonValue).to.eql(mockVantageResponse);

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

    const getVantageReferenceRecordsByMethodLookupIdsStub = sinon
      .stub(VantageService.prototype, 'getVantageReferenceRecordsByMethodLookupIds')
      .rejects(new Error('Test database error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { methodLookupId: ['1', '2'] };

    const requestHandler = getVantageReferenceRecords();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected method to throw');
    } catch (error) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;
      expect(getVantageReferenceRecordsByMethodLookupIdsStub).to.have.been.calledOnceWith([1, 2]);
      expect((error as HTTPError).message).to.equal('Test database error');
    }
  });
});
