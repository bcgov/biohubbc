import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiError } from '../errors/api-error';
import { SystemUser, UserRepository } from '../repositories/user-repository';
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
      mockUserRepository.resolves((mockResponseRow as unknown) as SystemUser);

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
      mockUserRepository.resolves((mockResponseRow as unknown) as SystemUser[]);

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
      mockUserRepository.resolves((mockResponseRow as unknown) as SystemUser[]);

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
      mockUserRepository.resolves((mockRowObj as unknown) as SystemUser);

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
      mockUserRepository.resolves(mockResponseRows as SystemUser[]);

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

      const addedSystemUser = ({ system_user_id: 2, record_end_date: null } as unknown) as SystemUser;
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

      const existingInactiveSystemUser: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
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

      const existingSystemUser: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: '1900-01-01',
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
      };

      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser: SystemUser = {
        system_user_id: 2,
        user_identifier: 'username',
        identity_source: SYSTEM_IDENTITY_SOURCE.IDIR,
        user_guid: '',
        record_end_date: null,
        role_ids: [1],
        role_names: ['Collaborator'],
        email: 'email@email.com',
        family_name: 'lname',
        given_name: 'fname',
        display_name: 'test user',
        agency: null
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
});
