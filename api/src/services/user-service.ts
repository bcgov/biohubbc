import { SYSTEM_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { SystemUser, UserRepository, UserSearchCriteria } from '../repositories/user-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

const defaultLog = getLogger('services/user-service');

export class UserService extends DBService {
  userRepository: UserRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.userRepository = new UserRepository(connection);
  }

  /**
   * Checks if the given system user is an admin (has an admin level system role).
   *
   * @param {SystemUser} systemUser
   * @return {*}  {boolean} `true` if the user is an admin, `false` otherwise.
   */
  static isAdmin(systemUser: SystemUser): boolean {
    return (
      systemUser.role_names.includes(SYSTEM_ROLE.SYSTEM_ADMIN) ||
      systemUser.role_names.includes(SYSTEM_ROLE.DATA_ADMINISTRATOR)
    );
  }

  /**
   * Fetch a single system user by their system user ID.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<SystemUser>)}
   * @memberof UserService
   */
  async getUserById(systemUserId: number): Promise<SystemUser> {
    const response = await this.userRepository.getUserById(systemUserId);

    return response;
  }

  /**
   * Get an existing system user by their GUID.
   *
   * @param {string} userGuid The user's GUID
   * @return {*}  {(Promise<SystemUser | null>)}
   * @memberof UserService
   */
  async getUserByGuid(userGuid: string): Promise<SystemUser | null> {
    defaultLog.debug({ label: 'getUserByGuid', userGuid });

    const response = await this.userRepository.getUserByGuid(userGuid);

    if (response.length !== 1) {
      return null;
    }

    return response[0];
  }

  /**
   * Get an existing system user by their user identifier and identity source.
   *
   * @param userIdentifier the user's identifier
   * @param identitySource the user's identity source, e.g. `'IDIR'`
   * @return {*}  {(Promise<SystemUser | null>)} Promise resolving the User, or `null` if the user wasn't found.
   * @memberof UserService
   */
  async getUserByIdentifier(userIdentifier: string, identitySource: string): Promise<SystemUser | null> {
    defaultLog.debug({ label: 'getUserByIdentifier', userIdentifier, identitySource });

    const response = await this.userRepository.getUserByIdentifier(userIdentifier, identitySource);

    if (response.length !== 1) {
      return null;
    }

    return response[0];
  }

  /**
   * Adds a new system user.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @return {*}  {Promise<SystemUser>}
   * @memberof UserService
   */
  async addSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string,
    givenName?: string,
    familyName?: string
  ): Promise<{ system_user_id: number }> {
    const response = await this.userRepository.addSystemUser(
      userGuid,
      userIdentifier,
      identitySource,
      displayName,
      email,
      givenName,
      familyName
    );

    return response;
  }

  /**
   * Get a list of all system users.
   *
   * @return {*}  {Promise<SystemUser[]>}
   * @memberof UserService
   */
  async listSystemUsers(): Promise<SystemUser[]> {
    const response = await this.userRepository.listSystemUsers();

    return response;
  }

  /**
   * Gets a system user, adding them if they do not already exist, or activating them if they had been deactivated (soft
   * deleted).
   *
   * @param {string | null} userGuid
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @return {*}  {Promise<SystemUser>}
   * @memberof UserService
   */
  async ensureSystemUser(
    userGuid: string | null,
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string,
    givenName?: string,
    familyName?: string
  ): Promise<SystemUser> {
    // Check if the user exists in SIMS
    const existingUser = userGuid
      ? await this.getUserByGuid(userGuid)
      : await this.getUserByIdentifier(userIdentifier, identitySource);

    if (!existingUser) {
      // Id of the current authenticated user
      const systemUserId = this.connection.systemUserId();

      if (!systemUserId) {
        throw new ApiExecuteSQLError('Failed to identify system user ID');
      }

      // Found no existing user, add them
      const newUserId = await this.addSystemUser(
        userGuid,
        userIdentifier,
        identitySource,
        displayName,
        email,
        givenName,
        familyName
      );

      // fetch the new user object
      return this.getUserById(newUserId.system_user_id);
    }

    if (!existingUser.record_end_date) {
      // system user is already active
      return existingUser;
    }

    // system user is not active, re-activate them
    await this.activateSystemUser(existingUser.system_user_id);

    // get the newly activated user
    return this.getUserById(existingUser.system_user_id);
  }

  /**
   * Activates an existing system user that had been deactivated (soft deleted).
   *
   * @param {number} systemUserId
   * @return {*}
   * @memberof UserService
   */
  async activateSystemUser(systemUserId: number) {
    return this.userRepository.activateSystemUser(systemUserId);
  }

  /**
   * Deactivates an existing system user (soft delete).
   *
   * @param {number} systemUserId
   * @return {*}
   * @memberof UserService
   */
  async deactivateSystemUser(systemUserId: number) {
    return this.userRepository.deactivateSystemUser(systemUserId);
  }

  /**
   * Delete all system roles for the user.
   *
   * @param {number} systemUserId
   * @return {*}
   * @memberof UserService
   */
  async deleteUserSystemRoles(systemUserId: number) {
    return this.userRepository.deleteUserSystemRoles(systemUserId);
  }

  /**
   * Adds the specified roleIds to the user.
   *
   * @param {number} systemUserId
   * @param {number[]} roleIds
   * @return {*}
   * @memberof UserService
   */
  async addUserSystemRoles(systemUserId: number, roleIds: number[]) {
    return this.userRepository.addUserSystemRoles(systemUserId, roleIds);
  }

  /**
   * Adds the specified role by name to the user.
   *
   * @param {number} systemUserId
   * @param {string} roleName
   * @return {*}
   * @memberof UserService
   */
  async addUserSystemRoleByName(systemUserId: number, roleName: string) {
    return this.userRepository.addUserSystemRoleByName(systemUserId, roleName);
  }

  /**
   * Delete all project participation roles for the specified system user.
   *
   * @param {number} systemUserId
   * @return {*}
   * @memberof UserService
   */
  async deleteAllProjectRoles(systemUserId: number) {
    return this.userRepository.deleteAllProjectRoles(systemUserId);
  }

  async getUsers(searchCriteria: UserSearchCriteria) {
    return this.userRepository.getUsers(searchCriteria);
  }
}
