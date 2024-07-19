import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import { SYSTEM_ROLE } from '../../constants/roles';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { FundingSource, FundingSourceSupplementaryData } from '../../repositories/funding-source-repository';
import { SystemUser } from '../../repositories/user-repository';
import { FundingSourceService } from '../../services/funding-source-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import { getFundingSources, postFundingSource } from '../funding-sources';

chai.use(sinonChai);

describe('getFundingSources', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('as an admin user', () => {
    it('returns an array of funding sources', async () => {
      const mockFundingSources: (FundingSource & FundingSourceSupplementaryData)[] = [
        {
          funding_source_id: 1,
          name: 'name',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description',
          revision_count: 0,
          survey_reference_amount_total: 2,
          survey_reference_count: 20000
        },
        {
          funding_source_id: 2,
          name: 'name2',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description2',
          revision_count: 0,
          survey_reference_amount_total: 3,
          survey_reference_count: 30000
        }
      ];

      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      sinon.stub(FundingSourceService.prototype, 'getFundingSources').resolves(mockFundingSources);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const systemUser: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [1],
        role_names: [SYSTEM_ROLE.SYSTEM_ADMIN],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };
      // system_user would be set by the authorization-service, if this endpoint was called for real
      mockreq.system_user = systemUser;

      const requestHandler = getFundingSources();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(mockFundingSources);

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
    });
  });

  describe('as a non-admin user', () => {
    it('returns an array of funding sources with sensitive fields removed', async () => {
      const mockFundingSources: (FundingSource & FundingSourceSupplementaryData)[] = [
        {
          funding_source_id: 1,
          name: 'name',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description',
          revision_count: 0,
          survey_reference_amount_total: 2,
          survey_reference_count: 20000
        },
        {
          funding_source_id: 2,
          name: 'name2',
          start_date: '2020-01-01',
          end_date: '2020-01-01',
          description: 'description2',
          revision_count: 0,
          survey_reference_amount_total: 3,
          survey_reference_count: 30000
        }
      ];

      const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

      sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

      sinon.stub(FundingSourceService.prototype, 'getFundingSources').resolves(mockFundingSources);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      const systemUser: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '123-456-789',
        record_end_date: null,
        role_ids: [3],
        role_names: [SYSTEM_ROLE.PROJECT_CREATOR], // Not an admin role
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };
      // system_user would be set by the authorization-service, if this endpoint was called for real
      mockreq.system_user = systemUser;

      const requestHandler = getFundingSources();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(mockRes.jsonValue).to.eql(
        mockFundingSources.map((item) => {
          // remove sensitive fields
          delete item.survey_reference_amount_total;
          delete item.survey_reference_count;
          return item;
        })
      );

      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(mockDBConnection.commit).to.have.been.calledOnce;
    });
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

describe('postFundingSource', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('creates a funding source', async () => {
    const mockFundingSources: FundingSource[] = [
      {
        funding_source_id: 1,
        name: 'name',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description'
      },
      {
        funding_source_id: 2,
        name: 'name2',
        start_date: '2020-01-01',
        end_date: '2020-01-01',
        description: 'description2'
      }
    ];

    const mockDBConnection = getMockDBConnection({ open: sinon.stub(), commit: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'postFundingSource').resolves({ funding_source_id: 1 });

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    mockReq.body = mockFundingSources;

    const requestHandler = postFundingSource();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockRes.jsonValue).to.eql({ funding_source_id: 1 });

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
  });

  it('catches and re-throws error', async () => {
    const mockDBConnection = getMockDBConnection({ rollback: sinon.stub(), release: sinon.stub() });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    sinon.stub(FundingSourceService.prototype, 'postFundingSource').rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

    const requestHandler = postFundingSource();

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
