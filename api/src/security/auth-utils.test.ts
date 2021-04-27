import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as auth_utils from './auth-utils';
import * as db from '../database/db';

chai.use(sinonChai);

describe('userHasValidSystemRoles', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = auth_utils.userHasValidSystemRoles([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = auth_utils.userHasValidSystemRoles(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});

describe("getSystemUser", function () {
  afterEach(() => {
    sinon.restore();
  });

  const keycloakToken = {
    key: 'value'
  };

  it("should return null when no system user id", async function () {
    sinon.stub(db, 'getDBConnection').resolves({
      systemUserId: () => {
        return null;
      }
    });

    const result = await auth_utils.getSystemUser(keycloakToken);

    expect(result).to.be.null;

    // const result = await getDBConnectionStub(keycloakToken);
    // console.log(result.systemUserId());

    // console.log(result);
  });
});

describe('authorize', function () {
  afterEach(() => {
    sinon.restore();
  });

  it('throws HTTP403 when the keycloak_token is empty', async function () {
    try {
      await auth_utils.authorize({ keycloak_token: '' }, ['abc']);
    } catch (e) {
      expect(JSON.stringify(e)).to.contain('Access Denied');
    }
  });

  it('returns true without scopes', async function () {
    const ret = await auth_utils.authorize({ keycloak_token: 'some token' }, []);
    expect(ret).to.be.true;
  });

  it('throws HTTP403 when stubbed getSystemUser returns null', async function () {
    const getSystemUserStub = sinon.stub(auth_utils, 'getSystemUser');

    try {
      await auth_utils.authorize({ keycloak_token: 'some token' }, ['abc']);
    } catch (e) {
      expect(JSON.stringify(e)).to.contain('Access Denied');
    }

    expect(getSystemUserStub).to.have.been.calledWith('some token');
    expect(getSystemUserStub).to.have.been.calledOnce;
    expect(getSystemUserStub).is.not.null;
  });
});
