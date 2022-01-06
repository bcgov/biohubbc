import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as create_no_sampling from './create-no-sampling';
import permit_queries from '../../queries/permit';
import * as db from '../../database/db';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../../__mocks__/db';
import { HTTPError } from '../../errors/custom-error';

chai.use(sinonChai);

describe('create-no-sampling', () => {
  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      coordinator: {
        first_name: 'first',
        last_name: 'last',
        email_address: 'email@example.com',
        coordinator_agency: 'agency',
        share_contact_details: true
      },
      permit: {
        permits: [
          {
            permit_number: 'number',
            permit_type: 'type'
          }
        ]
      }
    }
  } as any;

  let actualResult = {
    ids: null
  };

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  describe('createNoSamplePermits', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no permit passed in request body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = create_no_sampling.createNoSamplePermits();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, permit: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing request body param `permit`');
      }
    });

    it('should throw a 400 error when no coordinator passed in request body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = create_no_sampling.createNoSamplePermits();

        await result(
          { ...sampleReq, body: { ...sampleReq.body, coordinator: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing request body param `coordinator`');
      }
    });

    it('should return the inserted ids on success', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(create_no_sampling, 'insertNoSamplePermit').resolves(20);

      const result = create_no_sampling.createNoSamplePermits();

      await result(sampleReq, sampleRes as any, (null as unknown) as any);

      expect(actualResult.ids).to.eql([20]);
    });

    it('should throw an error when a failure occurs', async () => {
      const expectedError = new Error('cannot process request');

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(create_no_sampling, 'insertNoSamplePermit').rejects(expectedError);

      try {
        const result = create_no_sampling.createNoSamplePermits();

        await result(sampleReq, sampleRes as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal(expectedError.message);
      }
    });
  });
});

describe('insertNoSamplePermit', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection({
    systemUserId: () => {
      return 20;
    }
  });

  const permitData = {
    permit_number: 'number',
    permit_type: 'type'
  };

  const coordinatorData = {
    first_name: 'first',
    last_name: 'last',
    email_address: 'email@example.com',
    coordinator_agency: 'agency',
    share_contact_details: true
  };

  it('should throw an error when cannot generate post sql statement', async () => {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(null);

    try {
      await create_no_sampling.insertNoSamplePermit(permitData, coordinatorData, dbConnectionObj);

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to build SQL insert statement');
    }
  });

  it('should throw a HTTP 400 error when failed to insert non-sampling permits cause result is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [null] });

    sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(SQL`some`);

    try {
      await create_no_sampling.insertNoSamplePermit(permitData, coordinatorData, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert non-sampling permit data');
    }
  });

  it('should throw a HTTP 400 error when failed to insert non-sampling permits cause result id is null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: null }] });

    sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(SQL`some`);

    try {
      await create_no_sampling.insertNoSamplePermit(permitData, coordinatorData, {
        ...dbConnectionObj,
        query: mockQuery
      });

      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Failed to insert non-sampling permit data');
    }
  });

  it('should return the result id on success', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({ rows: [{ id: 12 }] });

    sinon.stub(permit_queries, 'postPermitNoSamplingSQL').returns(SQL`some`);

    const res = await create_no_sampling.insertNoSamplePermit(permitData, coordinatorData, {
      ...dbConnectionObj,
      query: mockQuery
    });

    expect(res).to.equal(12);
  });
});
