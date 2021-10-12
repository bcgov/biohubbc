import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as administrative_activity from './administrative-activity';
import * as administrative_queries from '../queries/administrative-activity/administrative-activity-queries';
import * as db from '../database/db';
import { getMockDBConnection } from '../__mocks__/db';
import SQL from 'sql-template-strings';

chai.use(sinonChai);

describe('updateAccessRequest', () => {
  afterEach(() => {
    sinon.restore();
  });

  const dbConnectionObj = getMockDBConnection();

  const sampleReq = {
    keycloak_token: {}
  } as any;

  it('should throw a 400 error when no system user id', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return null;
      }
    });

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to identify system user ID');
    }
  });

  it('should throw a 400 error when failed to build postAdministrativeActivitySQL statement', async () => {
    sinon.stub(db, 'getDBConnection').returns({
      ...dbConnectionObj,
      systemUserId: () => {
        return 20;
      }
    });
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(null);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to build SQL insert statement');
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
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(SQL`some`);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to submit administrative activity');
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
    sinon.stub(administrative_queries, 'postAdministrativeActivitySQL').returns(SQL`some`);

    try {
      const result = administrative_activity.createAdministrativeActivity();

      await result(sampleReq, (null as unknown) as any, (null as unknown) as any);
      expect.fail();
    } catch (actualError) {
      expect(actualError.status).to.equal(500);
      expect(actualError.message).to.equal('Failed to submit administrative activity');
    }
  });
});
