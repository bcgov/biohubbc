import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { userHasValidSystemRoles, authorize } from './auth-utils';
import * as auth_utils from './auth-utils';
//import { UserObject } from '../models/user';
const request = require('request');
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

  it('throws HTTP403 when the keycloak_token is empty', async function () {
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

  // it('calls authorize with valid parameters ', async function () {
  //   const request = {
  //     name: 'John Smith',
  //     preferred_username: 'jsmith',
  //     given_name: 'John',
  //     family_name: 'Smith',
  //     email: 'j@smith.com'
  //   };

  //   let systemUserWithRoles;

  //   const authorize = sinon.stub(auth_utils, 'authorize');
  //   const validRole = userHasValidSystemRoles('admin', 'admin');
  //   const userObject = new UserObject(systemUserWithRoles);

  //   try {
  //     await authorize(request, ['abc']);
  //   } catch (e) {
  //     //expect(JSON.stringify(e)).to.contain('Access Denied');
  //   }

  //   //expect(authorize).to.have.been.calledWith('abc');
  //   expect(authorize).to.have.been.calledOnce;
  //   expect(authorize).is.not.null;
  // });
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


describe('with mock: getPhotosByAlbumId', () => {
  it('should getPhotosByAlbumId', (done) => {
      let requestMock = sinon.mock(request);
      const user = [{
          "albumId": 1,
          "id": 1,
          "title": "accusamus beatae ad facilis cum similique qui sunt",
          "url": "https://via.placeholder.com/600/92c952",
          "thumbnailUrl": "https://via.placeholder.com/150/92c952"
      },
      {
          "albumId": 1,
          "id": 2,
          "title": "reprehenderit est deserunt velit ipsam",
          "url": "https://via.placeholder.com/600/771796",
          "thumbnailUrl": "https://via.placeholder.com/150/771796"
      },
      {
          "albumId": 1,
          "id": 3,
          "title": "officia porro iure quia iusto qui ipsa ut modi",
          "url": "https://via.placeholder.com/600/24f355",
          "thumbnailUrl": "https://via.placeholder.com/150/24f355"
      }];

      requestMock.expects("get")
          .once()
          .withArgs('https://jsonplaceholder.typicode.com/albums/2/photos?_limit=3')
          .yields(null, null, JSON.stringify(myPhotos));

      index.getAlbumById(2).then((photos) => {
          expect(photos.length).to.equal(3);
          photos.forEach((photo) => {
              expect(photo).to.have.property('id');
              expect(photo).to.have.property('title');
              expect(photo).to.have.property('url');
          });

          requestMock.verify();
          requestMock.restore();
          done();
      });
  });
});


