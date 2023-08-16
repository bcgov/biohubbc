import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as user from './add';

chai.use(sinonChai);

describe('user', () => {
  describe('addSystemRoleUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should throw a 400 error when no req body', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = undefined;

      try {
        const requestHandler = user.addSystemRoleUser();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no userIdentifier', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        userGuid: 'aaaa',
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      try {
        const requestHandler = user.addSystemRoleUser();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: userIdentifier');
      }
    });

    it('should throw a 400 error when no identitySource', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        userGuid: 'aaaa',
        userIdentifier: 'username',
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      try {
        const requestHandler = user.addSystemRoleUser();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: identitySource');
      }
    });

    it('should throw a 400 error when no roleId', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        userGuid: 'aaaa',
        userIdentifier: 'username',
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        displayName: 'display name',
        email: 'email'
      };

      try {
        const requestHandler = user.addSystemRoleUser();

        await requestHandler(mockReq, mockRes, mockNext);
        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).status).to.equal(400);
        expect((actualError as HTTPError).message).to.equal('Missing required body param: roleId');
      }
    });

    it('adds a system user and returns 200 on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        userGuid: 'aaaa',
        userIdentifier: 'username',
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      const mockUserObject: User = {
        system_user_id: 1,
        user_identifier: '',
        user_guid: '',
        identity_source: '',
        record_end_date: '',
        role_ids: [1],
        role_names: []
      };

      const ensureSystemUserStub = sinon.stub(UserService.prototype, 'ensureSystemUser').resolves(mockUserObject);

      const adduserSystemRolesStub = sinon.stub(UserService.prototype, 'addUserSystemRoles');

      const requestHandler = user.addSystemRoleUser();

      await requestHandler(mockReq, mockRes, mockNext);

      expect(ensureSystemUserStub).to.have.been.calledOnce;
      expect(adduserSystemRolesStub).to.have.been.calledOnce;
    });

    it('should success when no userGuid', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        userIdentifier: 'username',
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      const mockUserObject: User = {
        system_user_id: 1,
        user_identifier: '',
        user_guid: '',
        identity_source: '',
        record_end_date: '',
        role_ids: [1],
        role_names: []
      };

      const ensureSystemUserStub = sinon.stub(UserService.prototype, 'ensureSystemUser').resolves(mockUserObject);

      const adduserSystemRolesStub = sinon.stub(UserService.prototype, 'addUserSystemRoles');

      const requestHandler = user.addSystemRoleUser();

      await requestHandler(mockReq, mockRes, mockNext);
      expect(ensureSystemUserStub).to.have.been.calledOnce;
      expect(adduserSystemRolesStub).to.have.been.calledOnce;
    });
  });
});
