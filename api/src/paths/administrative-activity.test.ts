import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../database/db';
import { HTTPError } from '../errors/http-error';
import * as keycloak_utils from '../utils/keycloak-utils';
import { getMockDBConnection } from '../__mocks__/db';
import * as administrative_activity from './administrative-activity';
import { QueryResult } from 'pg';
import { AdministrativeActivityRepository } from '../repositories/administrative-activity-repository';

chai.use(sinonChai);

describe('openapi schema', () => {
  // @TODO;
});

describe('createAdministrativeActivity', () => {
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

  it('should throw a 500 error when failed to submit administrative activity due to response being undefined', async () => {
    const mockDBConnection = getMockDBConnection({
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);
    sinon.stub(AdministrativeActivityRepository.prototype, 'postAdministrativeActivity').resolves(undefined);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect((actualError as HTTPError).status).to.equal(500);
      expect((actualError as HTTPError).message).to.equal('Failed to submit administrative activity');
    }
  });

  it('catches and rethrows errors', async () => {
    // @TODO
  });

  it('should succeed', async () => {
    const mockDBConnection = getMockDBConnection({
      sql: async () => {
        return ({
          rowCount: 1,
          rows: [
            { id: 1, date: '2020/04/04' }
          ]
        } as any) as Promise<QueryResult<any>>;
      },
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

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

  it('should throw a 400 error when no user identifier', async () => {
    sinon.stub(keycloak_utils, 'getUserIdentifier').returns(null);
    const mockDBConnection = getMockDBConnection();

    const sampleReq = {
      keycloak_token: {}
    } as any;

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

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
