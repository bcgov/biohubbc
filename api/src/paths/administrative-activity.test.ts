import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/http-error';
import * as keycloak_utils from '../utils/keycloak-utils';
import { getMockDBConnection } from '../__mocks__/db';
import * as administrative_activity from './administrative-activity';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };

  it('should throw a 400 error when no system user id', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return (null as unknown) as number;
      }
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to rows being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [null]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to submit administrative activity');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to row id being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: null,
          create_date: null
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to submit administrative activity');
    }
  });

  it('should throw a 400 error when failed to submit administrative activity due to row id being null', async () => {
    const mockQuery = sinon.stub();

    mockQuery.resolves({
      rows: [
        {
          id: 1,
          create_date: '2020/04/04'
        }
      ]
    });

    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      },
      query: mockQuery
    });

    const result = administrative_activity.createAdministrativeActivity();

    await result(sampleReq, sampleRes as any, (null as unknown) as any);

    expect(actualResult).to.eql({
      id: 1,
      date: '2020/04/04'
    });
  });
});

describe('getAdministrativeActivityStanding', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  /*
  let actualResult: any = null;

  const sampleRes = {
    status: () => {
      return {
        json: (result: any) => {
          actualResult = result;
        }
      };
    }
  };
  */

  it('should throw a 400 error when no user identifier', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns(null);

    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    try {
      const result = administrative_activity.getAdministrativeActivityStanding();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(400);
      expect((actualError as HTTPError).message).to.equal('Missing required userIdentifier');
    }
  });

  it('should return admin activity standing on success', async () => {
    // @TODO
  });
});
