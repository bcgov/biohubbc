import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as self from './self';
import * as db from '../../database/db';

chai.use(sinonChai);

describe('getUser', function () {
  afterEach(() => {
    sinon.restore();
  });

  const keycloakToken = {
    key: 'value'
  };

  const dbConnectionObj = {
    systemUserId: () => {
      return null;
    },
    open: async () => {
      // do nothing
    },
    release: () => {
      // do nothing
    },
    commit: async () => {
      // do nothing
    },
    rollback: async () => {
      // do nothing
    },
    query: async () => {
      // do nothing
    }
  };

  it('should return null when no system user id', async function () {
    sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

    const result = await self.getUser();

    try {
      await auth_utils.getSystemUser(keycloakToken);
      expect.fail();
    } catch (actualError) {
      expect(actualError.message).to.equal(expectedError.message);
    }
  });
});
