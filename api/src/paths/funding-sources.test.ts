import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/http-error';
import { FundingSource } from '../repositories/funding-source-repository';
import { FundingSourceService } from '../services/funding-source-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../__mocks__/db';
import { getFundingSources } from './funding-sources';

chai.use(sinonChai);

describe('getFundingSources', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('returns an array of funding sources', async () => {
    const mockFundingSources: FundingSource[] = [
      {
        funding_source_id: 1,
        name: 'name',
        description: 'description'
      },
      {
        funding_source_id: 2,
        name: 'name2',
        description: 'description2'
      }
    ];

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'getFundingSources').resolves(mockFundingSources);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getFundingSources();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockFundingSources);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'getFundingSources').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getFundingSources();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail();
    } catch (actualError) {
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
