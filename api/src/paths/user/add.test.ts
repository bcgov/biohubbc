import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/custom-error';
import { getMockDBConnection } from '../../__mocks__/db';
import * as user from './add';
import * as system_user from '../../paths-helpers/system-user';
import * as system_roles from './{userId}/system-roles/update';

chai.use(sinonChai);

describe('user', () => {
  const dbConnectionObj = getMockDBConnection();

  describe('addSystemRoleUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    const sampleReq = {
      keycloak_token: {},
      params: {
        userId: 2
      },
      body: {
        userIdentifier: 'uid',
        identitySource: 'idsource',
        roles: [1]
      }
    } as any;

    it('should throw a 400 error when no req body', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addSystemRoleUser();

        await result({ ...(sampleReq as any), body: null }, (null as unknown) as any, (null as unknown) as any);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no userIdentifier', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addSystemRoleUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, userIdentifier: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no identitySource', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addSystemRoleUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, identitySource: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: identitySource');
      }
    });

    it('should throw a 400 error when no roleId', async () => {
      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      try {
        const result = user.addSystemRoleUser();

        await result(
          { ...(sampleReq as any), body: { ...sampleReq.body, roleId: null } },
          (null as unknown) as any,
          (null as unknown) as any
        );
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: roleId');
      }
    });

    it('adds a system user and returns 200 on success', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getSystemUserStub = sinon.stub(system_user, 'getSystemUser').resolves(existingSystemUser);

      const addedSystemUser = { id: 2, user_record_end_date: null };
      const addSystemUserStub = sinon.stub(system_user, 'addSystemUser').resolves(addedSystemUser);

      const activateDeactivatedSystemUserStub = sinon
        .stub(system_user, 'activateDeactivatedSystemUser')
        .resolves(addedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.ensureSystemUser(userIdentifier, identitySource, mockDBConnection);

      expect(result.id).to.equal(2);
      expect(result.user_record_end_date).to.equal(null);

      expect(getSystemUserStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateDeactivatedSystemUserStub).not.to.have.been.called;
    });

    it('should return status 200 on success', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getSystemUserStub = sinon.stub(system_user, 'getSystemUser').resolves(existingSystemUser);

      const addedSystemUser = { id: 2, user_record_end_date: null };
      const addSystemUserStub = sinon.stub(system_user, 'addSystemUser').resolves(addedSystemUser);

      const activateDeactivatedSystemUserStub = sinon
        .stub(system_user, 'activateDeactivatedSystemUser')
        .resolves(addedSystemUser);

      const userIdentifier = 'username';
      const identitySource = 'idir';

      const result = await system_user.ensureSystemUser(userIdentifier, identitySource, mockDBConnection);

      expect(result.id).to.equal(2);
      expect(result.user_record_end_date).to.equal(null);

      sinon.stub(system_roles, 'addUserSystemRoles');

      expect(getSystemUserStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateDeactivatedSystemUserStub).not.to.have.been.called;
    });
  });
});
