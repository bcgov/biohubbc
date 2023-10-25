import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import {
  FundingSource,
  FundingSourceSupplementaryData,
  SurveyFundingSource,
  SurveyFundingSourceSupplementaryData
} from '../../repositories/funding-source-repository';
import { FundingSourceService } from '../../services/funding-source-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { deleteFundingSource, getFundingSource, putFundingSource } from './{fundingSourceId}';

chai.use(sinonChai);

describe('getFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('gets a funding source', async () => {
    const mockFundingSource: {
      funding_source: FundingSource & FundingSourceSupplementaryData;
      funding_source_survey_references: (SurveyFundingSource | SurveyFundingSourceSupplementaryData)[];
    } = {
      funding_source: {
        funding_source_id: 1,
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description',
        revision_count: 1,
        survey_reference_amount_total: 100000,
        survey_reference_count: 2
      },
      funding_source_survey_references: [
        {
          survey_funding_source_id: 1,
          survey_id: 2,
          funding_source_id: 3,
          amount: 500,
          revision_count: 0,
          project_id: 1,
          survey_name: 'survey name'
        }
      ]
    };

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'getFundingSource').resolves(mockFundingSource);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getFundingSource();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockFundingSource);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'getFundingSource').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = getFundingSource();

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

describe('putFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('updates a funding source', async () => {
    const mockFundingSource: Pick<FundingSource, 'funding_source_id'> = {
      funding_source_id: 1
    };

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'putFundingSource').resolves(mockFundingSource);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = putFundingSource();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockFundingSource);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'putFundingSource').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = putFundingSource();

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

describe('deleteFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('deletes a funding source', async () => {
    const mockFundingSource: Pick<FundingSource, 'funding_source_id'> = {
      funding_source_id: 1
    };

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'deleteFundingSource').resolves(mockFundingSource);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = deleteFundingSource();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql(mockFundingSource);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'deleteFundingSource').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = deleteFundingSource();

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
