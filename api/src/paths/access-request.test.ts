import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as access_request from './access-request';
import * as user_queries from '../queries/users/user-queries';
import * as db from '../database/db';
import SQL from 'sql-template-strings';
import { getMockDBConnection } from '../__mocks__/db';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {},
    body: {
      userIdentifier: 1,
      identitySource: 'identitySource',
      requestId: 1,
      requestStatusTypeId: 1
    }
  } as any;

  // let actualResult: any = null;

  // const sampleRes = {
  //   status: () => {
  //     return {
  //       json: (result: any) => {
  //         actualResult = result;
  //       }
  //     };
  //   }
  // };

  it('should throw a 400 error when no user identifier body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, userIdentifier: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param: userIdentifier');
    }
  });

  it('should throw a 400 error when no identity source body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, identitySource: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param: identitySource');
    }
  });

  it('should throw a 400 error when no request id body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, requestId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param: requestId');
    }
  });

  it('should throw a 400 error when no request status type id body param', async () => {
    try {
      const result = access_request.updateAccessRequest();

      await result(
        { ...sampleReq, body: { ...sampleReq.body, requestStatusTypeId: null } },
        (null as unknown) as any,
        (null as unknown) as any
      );
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Missing required body param: requestStatusTypeId');
    }
  });

  it('should throw a 400 error when fails to get getUserByUserIdentifierSQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(null);

    try {
      const result = access_request.updateAccessRequest();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to build SQL get statement');
    }
  });

  it('should throw a 400 error when no userId and no systemUserId', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [null],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return null;
      },
      query: mockQuery
    });
    sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(SQL`something`);

    try {
      const result = access_request.updateAccessRequest();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(400);
      expect(actualError.message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 500 error when userId but no userObject', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 1,
          user_identifier: null,
          role_ids: [1, 2],
          role_name: ['System Admin', 'Project Lead']
        }
      ],
      rowCount: 1
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return null;
      },
      query: mockQuery
    });
    sinon.stub(user_queries, 'getUserByUserIdentifierSQL').returns(SQL`something`);

    try {
      const result = access_request.updateAccessRequest();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to get or add system user');
    }
  });
});
