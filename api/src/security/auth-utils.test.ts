import chai,{ expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { userHasValidSystemRoles, authorize } from './auth-utils';
import * as auth_utils from './auth-utils';
// import { getDBConnection } from '../database/db';
// import pg from 'pg';
//import { getDBConnection, IDBConnection } from '../database/db';

chai.use(sinonChai);

describe('userHasValidSystemRoles', () => {
  describe('validSystemRoles is a string', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = userHasValidSystemRoles('', '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = userHasValidSystemRoles('admin', '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles('admin', 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = userHasValidSystemRoles('', []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles('admin', ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles('admin', ['admin']);

        expect(response).to.be.true;
      });
    });
  });

  describe('validSystemRoles is an array', () => {
    describe('userSystemRoles is a string', () => {
      it('returns true if the valid roles is empty', () => {
        const response = userHasValidSystemRoles([], '');

        expect(response).to.be.true;
      });

      it('returns false if the user has no roles', () => {
        const response = userHasValidSystemRoles(['admin'], '');

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], 'user');

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles(['admin'], 'admin');

        expect(response).to.be.true;
      });
    });

    describe('userSystemRoles is an array', () => {
      it('returns true if the valid roles is empty', () => {
        const response = userHasValidSystemRoles([], []);

        expect(response).to.be.true;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], []);

        expect(response).to.be.false;
      });

      it('returns false if the user has no matching roles', () => {
        const response = userHasValidSystemRoles(['admin'], ['user']);

        expect(response).to.be.false;
      });

      it('returns true if the user has a matching role', () => {
        const response = userHasValidSystemRoles(['admin'], ['admin']);

        expect(response).to.be.true;
      });
    });
  });
});

//const assert = require('assert');

describe('authorize', function () {
  //const getSystemUserStub = sinon.stub(auth_utils,'getSystemUser');

  beforeEach(function () {
    // const fake = {
    //   a: sinon.stub().resolves({ rows: [] }),
    //   b: sinon.stub().resolves({ hello: 'world' })
    // };
    //getSystemUserStub = sinon.stub(auth_utils,'getSystemUser');
  });

  afterEach(function () {
    //getSystemUserStub.restore;
  });

  it('throws HTTP403 when keycloak_token is empty', async function () {
    try {
      await authorize({ keycloak_token: '' }, ['abc']);
    } catch (e) {
      expect(JSON.stringify(e)).to.contain('Access Denied');
    }
  });

  it('returns true without scopes', async function () {
    const ret = await authorize({ keycloak_token: 'some token' }, []);
    expect(ret).to.be.true;
  });



  it('throws HTTP403 when stubbed getSystemUser returns null', async function () {
    const getSystemUserStub = sinon.stub(auth_utils, 'getSystemUser');

    try {
      await authorize({ keycloak_token: 'some token' }, ['abc']);
    } catch (e) {
      expect(JSON.stringify(e)).to.contain('Access Denied');
    }

    expect(getSystemUserStub).to.have.been.calledWith('some token');
    expect(getSystemUserStub).to.have.been.calledOnce;
    expect(getSystemUserStub).is.not.null;
  });
});









// describe('a test', () => {
//   afterEach(() => {
//     sinon.restore();
//   });
//   it('should pass', async () => {
//     const mPool = { query: sinon.stub().resolves({ rows: [] }) };
//     const poolStub = sinon.stub(pg, 'Pool').callsFake(() => mPool);
//     const connection = getDBConnection({ token: 'keycloakToken' });
//     const actual = await connection.systemUserId;
//     const open = await connection.open;
//     const result = await connection.query('SELECT now();');
//     expect(actual).is.not.null;
//     expect(open).is.not.null;
//     expect(result).is.not.null;
//     //sinon.assert.calledOnce(poolStub);
//     expect(poolStub).not.to.be.called;
//     //sinon.assert.calledOnce(mPool.query);
//   });
// });
