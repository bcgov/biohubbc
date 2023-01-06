import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiError } from '../errors/api-error';
import { UserObject } from '../models/user';
import { IGetUser, IInsertUser, UserRepository } from '../repositories/user-repository';
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
      mockUserRepository.resolves(mockResponseRow as unknown as IGetUser);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserById(1);

      expect(result).to.eql(new UserObject(mockResponseRow));
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
      mockUserRepository.resolves(mockResponseRow as unknown as IGetUser[]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.getUserByGuid('aaaa');

      expect(result).to.eql(new UserObject(mockResponseRow[0]));
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
      mockUserRepository.resolves(mockRowObj as unknown as IInsertUser);

      const userService = new UserService(mockDBConnection);

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const result = await userService.addSystemUser(userGuid, userIdentifier, identitySource);

      expect(result).to.eql(new UserObject(mockRowObj));
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
      mockUserRepository.resolves(mockResponseRows as IGetUser[]);

      const userService = new UserService(mockDBConnection);

      const result = await userService.listSystemUsers();

      expect(result).to.eql([
        new UserObject(mockResponseRows[0]),
        new UserObject(mockResponseRows[1]),
        new UserObject(mockResponseRows[2])
      ]);
    });
  });

  describe('ensureSystemUser', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('throws an error if it fails to get the current system user id', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => null as unknown as number });

      const existingSystemUser = null;
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');
      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      try {
        await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);
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

      const addedSystemUser = new UserObject({ system_user_id: 2, record_end_date: null });
      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser').resolves(addedSystemUser);

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).to.have.been.calledOnce;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is already activate', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingInactiveSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingInactiveSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).not.to.have.been.called;
    });

    it('gets an existing system user that is not already active and re-activates it', async () => {
      const mockDBConnection = getMockDBConnection({ systemUserId: () => 1 });

      const existingSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: '2021-11-22',
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByGuidStub = sinon.stub(UserService.prototype, 'getUserByGuid').resolves(existingSystemUser);

      const addSystemUserStub = sinon.stub(UserService.prototype, 'addSystemUser');

      const activateSystemUserStub = sinon.stub(UserService.prototype, 'activateSystemUser');

      const activatedSystemUser = new UserObject({
        system_user_id: 2,
        user_identifier: SYSTEM_IDENTITY_SOURCE.IDIR,
        record_end_date: null,
        role_ids: [1],
        role_names: ['Editor']
      });
      const getUserByIdStub = sinon.stub(UserService.prototype, 'getUserById').resolves(activatedSystemUser);

      const userIdentifier = 'username';
      const userGuid = 'aaaa';
      const identitySource = SYSTEM_IDENTITY_SOURCE.IDIR;

      const userService = new UserService(mockDBConnection);

      const result = await userService.ensureSystemUser(userGuid, userIdentifier, identitySource);

      expect(result.id).to.equal(2);
      expect(result.record_end_date).to.equal(null);

      expect(getUserByGuidStub).to.have.been.calledOnce;
      expect(addSystemUserStub).not.to.have.been.called;
      expect(activateSystemUserStub).to.have.been.calledOnce;
      expect(getUserByIdStub).to.have.been.calledOnce;
    });
  });

  describe('activateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'activateSystemUser');
      mockUserRepository.resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.activateSystemUser(1);

      expect(result).to.be.undefined;
    });
  });

  describe('deactivateSystemUser', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'deactivateSystemUser');
      mockUserRepository.resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.deactivateSystemUser(1);

      expect(result).to.be.undefined;
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

  describe('addUserSystemRoles', function () {
    afterEach(() => {
      sinon.restore();
    });

    it('returns nothing on success', async function () {
      const mockDBConnection = getMockDBConnection();
      const mockUserRepository = sinon.stub(UserRepository.prototype, 'addUserSystemRoles');
      mockUserRepository.resolves();

      const userService = new UserService(mockDBConnection);

      const result = await userService.addUserSystemRoles(1, [1]);

      expect(result).to.be.undefined;
    });
  });
});
