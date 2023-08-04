import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiError } from '../errors/api-error';
import { User } from '../models/user';
import { UserRepository } from '../repositories/user-repository';
import {
  BceidBasicUserInformation,
  BceidBusinessUserInformation,
  DatabaseUserInformation,
  IdirUserInformation
} from '../utils/keycloak-utils';
import { getMockDBConnection } from '../__mocks__/db';
import { UserService } from './user-service';

chai.use(sinonChai);

describe('UserService', () => {
  describe('getUserById', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns a UserObject', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockResponseRow = { system_user_id: 123 };
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'getUserById');
      mockUserRepository.resolves((mockResponseRow as unknown) as User);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserById(1);

      expect(result).to.eql(mockResponseRow);
      expect(mockUserRepository).to.have.been.calledOnce;
    });
  });

  describe('getUserByGuid', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the query response has no rows', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'getUserByGuid');
      mockUserRepository.resolves([]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByGuid('aaaa');

      expect(result).to.be.null;
      expect(mockUserRepository).to.have.been.calledOnce;
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockResponseRow = [{ system_user_id: 123 }];
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'getUserByGuid');
      mockUserRepository.resolves((mockResponseRow as unknown) as User[]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByGuid('aaaa');

      expect(result).to.eql(mockResponseRow[0]);
      expect(mockUserRepository).to.have.been.calledOnce;
    });
  });

  describe('getUserByIdentifier', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns null if the query response has no rows', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'getUserByIdentifier');
      mockUserRepository.resolves([]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByIdentifier('aaaa', 'bbbb');

      expect(result).to.be.null;
      expect(mockUserRepository).to.have.been.calledOnce;
    });

    it('returns a UserObject for the first row of the response', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockResponseRow = [{ system_user_id: 123 }];
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'getUserByIdentifier');
      mockUserRepository.resolves((mockResponseRow as unknown) as User[]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByIdentifier('aaaa', 'bbbb');

      expect(result).to.eql(mockResponseRow[0]);
      expect(mockUserRepository).to.have.been.calledOnce;
    });
  });

  describe('addSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should not throw an error on success', async () => {
      const mockDBConnection = getMockDBConnection();

      const mockRowObj = { system_user_id: 123 };
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'addSystemUser');
      mockUserRepository.resolves((mockRowObj as unknown) as User);

      const userService = new UserService(mockDBConnection);

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;
      const displayName = 'display name';
      const email = 'email';

      const result = await userService.addSystemUser(userGuid, userIdentifier, identitySource, displayName, email);

      expect(result).to.eql(mockRowObj);
      expect(mockUserRepository).to.have.been.calledOnce;
    });
  });

  describe('listSystemUsers', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns empty array if the query response has no rows', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'listSystemUsers');
      mockUserRepository.resolves([]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([]);
    });

    it('returns a UserObject for each row of the response', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockResponseRows = [{ system_user_id: 123 }, { system_user_id: 456 }, { system_user_id: 789 }];
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'listSystemUsers');
      mockUserRepository.resolves(mockResponseRows as User[]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([mockResponseRows[0], mockResponseRows[1], mockResponseRows[2]]);
    });
  });

  describe('ensureSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if it fails to get the current system user id', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => (null as unknown) as number });

      const existingSystemUser = null;
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');
      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;
      const displayName = 'display name';
      const email = 'email';

      const userService = new UserService(mockDBConnection);

      try {
        await userService.ensureSystemUser(userGuid, userIdentifier, identitySource, displayName, email);
        expect.fail();
      } catch (actualError) {
        expect((actualError as ApiError).message).to.equal('Failed to identify system user ID');
      }

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('adds a new system user if one does not already exist', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = null;
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addedSystemUser = ({ system_user_id: 2, record_end_date: null } as unknown) as User;
      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser').resolves(addedSystemUser);

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const getUserById = sinon.stub(UserService.prototype, 'getUserById').resolves(addedSystemUser);

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;
      const displayName = 'display name';
      const email = 'email';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource, displayName, email);

      expect(result.system_user_id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(getUserById).to.have.been.calledOnce;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is already activate', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingInactiveSystemUser: User = {
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator']
      };

      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingInactiveSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;
      const displayName = 'display name';
      const email = 'email';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource, displayName, email);

      expect(result.system_user_id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is not already active and re-activates it', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser: User = {
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: '1900-01-01',
        role_ids: [1],
        role_names: ['Collaborator']
      };

      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser: User = {
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator']
      };

      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(activatedSystemUser);

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;
      const displayName = 'display name';
      const email = 'email';

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource, displayName, email);

      expect(result.system_user_id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).to.have.been.calledOnce;
      expect(getUserByIdStub).to.have.been.calledOnce;
    });
  });

  describe('deleteUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'deleteUserSystemRoles');
      mockUserRepository.resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.deleteUserSystemRoles(1);

      expect(result).to.be.undefined;
    });
  });

  describe('updateSystemUserInformation', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('identifies a database user information object and does nothing and returns null', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockUserRepository = sinon.stub(UserRepository.prototype, 'updateSystemUserInformation').resolves(1);

      const userService = new UserService(mockDBConnection);

      const keycloakUserInformation: DatabaseUserInformation = {
        database_user_guid: '123456789',
        identity_provider: 'database',
        username: 'biohub_dapi_v1'
      };

      const result = await userService.updateSystemUserInformation(keycloakUserInformation);

      expect(result).to.be.null;

      expect(mockUserRepository).not.to.have.been.called;
    });

    it('identifies an idir user information object and updates the user', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockUserRepository = sinon.stub(UserRepository.prototype, 'updateSystemUserInformation').resolves(1);

      const userService = new UserService(mockDBConnection);

      const keycloakUserInformation: IdirUserInformation = {
        idir_user_guid: '123456789',
        identity_provider: 'idir',
        idir_username: 'testuser',
        email_verified: false,
        name: 'test user',
        preferred_username: 'testguid@idir',
        display_name: 'test user',
        given_name: 'test',
        family_name: 'user',
        email: 'email@email.com'
      };

      const result = await userService.updateSystemUserInformation(keycloakUserInformation);

      expect(result).to.equal(1);

      expect(mockUserRepository).to.have.been.calledWith({
        user_guid: keycloakUserInformation.idir_user_guid,
        user_identifier: keycloakUserInformation.idir_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name
      });
    });

    it('identifies a bceid business user information object and updates the user', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockUserRepository = sinon.stub(UserRepository.prototype, 'updateSystemUserInformation').resolves(1);

      const userService = new UserService(mockDBConnection);

      const keycloakUserInformation: BceidBusinessUserInformation = {
        bceid_business_guid: '1122334455',
        bceid_business_name: 'Business Name',
        bceid_user_guid: '123456789',
        identity_provider: 'bceidbusiness',
        bceid_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@bceidbusiness',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const result = await userService.updateSystemUserInformation(keycloakUserInformation);

      expect(result).to.equal(1);

      expect(mockUserRepository).to.have.been.calledWith({
        user_guid: keycloakUserInformation.bceid_user_guid,
        user_identifier: keycloakUserInformation.bceid_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name,
        agency: keycloakUserInformation.bceid_business_name
      });
    });

    it('identifies a bceid basic user information object and updates the user', async function () {
      const mockDBConnection = getMockDBConnection();

      const mockUserRepository = sinon.stub(UserRepository.prototype, 'updateSystemUserInformation').resolves(1);

      const userService = new UserService(mockDBConnection);

      const keycloakUserInformation: BceidBasicUserInformation = {
        bceid_user_guid: '123456789',
        identity_provider: 'bceidbasic',
        bceid_username: 'tname',
        name: 'Test Name',
        preferred_username: '123456789@bceidbasic',
        display_name: 'Test Name',
        email: 'email@email.com',
        email_verified: false,
        given_name: 'Test',
        family_name: ''
      };

      const result = await userService.updateSystemUserInformation(keycloakUserInformation);

      expect(result).to.equal(1);

      expect(mockUserRepository).to.have.been.calledWith({
        user_guid: keycloakUserInformation.bceid_user_guid,
        user_identifier: keycloakUserInformation.bceid_username,
        user_identity_source: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC,
        display_name: keycloakUserInformation.display_name,
        email: keycloakUserInformation.email,
        given_name: keycloakUserInformation.given_name,
        family_name: keycloakUserInformation.family_name
      });
    });
  });
});
