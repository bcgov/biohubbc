import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../../constants/database';
import * as db from '../../database/db';
import { SystemUser } from '../../repositories/user-repository';
import { UserService } from '../../services/user-service';
import * as keycloakUtils from '../../utils/keycloak-utils';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as user from './add';

chai.use(sinonChai);

describe('user', () => {
  describe('addSystemRoleUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('adds a system user and returns 200 on success', async () => {
      const dbConnectionObj = getMockDBConnection();

      sinon.stub(db, 'getDBConnection').returns(dbConnectionObj);
      sinon.stub(keycloakUtils, 'getKeycloakSource').resolves(true);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        userGuid: 'aaaa',
        userIdentifier: 'username',
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      const mockUserObject: SystemUser = {
        system_user_id: 1,
        user_identifier: '',
        user_guid: '',
        identity_source: '',
        record_end_date: '',
        role_ids: [1],
        role_names: [],
        email: '',
        family_name: '',
        given_name: '',
        display_name: '',
        agency: null
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
      sinon.stub(keycloakUtils, 'getKeycloakSource').resolves(true);

      const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();

      mockReq.body = {
        identitySource: SYSTEM_IDENTITY_SOURCE.IDIR,
        userIdentifier: 'username',
        displayName: 'display name',
        email: 'email',
        roleId: 1
      };

      const mockUserObject: SystemUser = {
        system_user_id: 1,
        user_identifier: '',
        user_guid: '',
        identity_source: '',
        record_end_date: '',
        role_ids: [1],
        role_names: [],
        email: 'email@email.com',
        family_name: '',
        given_name: '',
        display_name: 'test user',
        agency: null
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
