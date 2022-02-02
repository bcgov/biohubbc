import axios from 'axios';
import qs from 'qs';
import { ApiGeneralError } from '../errors/custom-error';

type KeycloakUserData = {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  attributes: IDIRAttributes | BCEIDAttributes;
  disableableCredentialTypes: [];
  requiredActions: [];
  notBefore: number;
  access: {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  };
};

type IDIRAttributes = {
  idir_user_guid: [string];
  idir_userid: [string];
  idir_guid: [string];
  displayName: [string];
};

type BCEIDAttributes = {
  bceid_userid: [string];
  displayName: [string];
};

export type KeycloakUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  attributes: IDIRAttributes | BCEIDAttributes;
};

/**
 * Service for calling the keycloak admin API.
 *
 * @export
 * @class KeycloakService
 */
export class KeycloakService {
  keycloakRealmUrl: string;
  keycloakAdminUrl: string;

  constructor() {
    this.keycloakRealmUrl = `${process.env.KEYCLOAK_HOST}/auth/realms/${process.env.KEYCLOAK_REALM}`;
    this.keycloakAdminUrl = `${process.env.KEYCLOAK_HOST}/auth/admin/realms/${process.env.KEYCLOAK_REALM}`;
  }

  /**
   * Get an access token from keycloak for the service account user.
   *
   * @return {*}  {Promise<string>}
   * @memberof KeycloakService
   */
  async getKeycloakToken(): Promise<string> {
    try {
      const { data } = await axios.post(
        `${this.keycloakRealmUrl}/protocol/openid-connect/token`,
        qs.stringify({ grant_type: 'client_credentials' }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          auth: {
            username: process.env.KEYCLOAK_ADMIN_USERNAME as string,
            password: process.env.KEYCLOAK_ADMIN_PASSWORD as string
          }
        }
      );

      return data.access_token as string;
    } catch (error) {
      throw new ApiGeneralError('Failed to authenticate with keycloak', [(error as Error).message]);
    }
  }

  /**
   * Fetch keycloak user data by the keycloak username.
   *
   * Note on IDIR and BCEID usernames:
   * - Format is `<username>@idir` or `<username>@bceid`
   *
   * @param {string} username
   * @return {*}  {Promise<KeycloakUser>}
   * @memberof KeycloakService
   */
  async getUserByUsername(username: string): Promise<KeycloakUser> {
    const token = await this.getKeycloakToken();

    try {
      const { data } = await axios.get<KeycloakUserData[]>(
        `${this.keycloakAdminUrl}/users/?${qs.stringify({ username: username })}`,
        {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      );

      if (!data.length) {
        throw new ApiGeneralError('Found no matching keycloak users');
      }

      if (data.length !== 1) {
        throw new ApiGeneralError('Found too many matching keycloak users');
      }

      return {
        id: data[0].id,
        firstName: data[0].firstName,
        lastName: data[0].lastName,
        email: data[0].email,
        active: data[0].enabled,
        username: data[0].username,
        attributes: data[0].attributes
      };
    } catch (error) {
      throw new ApiGeneralError('Failed to get user info from keycloak', [(error as Error).message]);
    }
  }
}
