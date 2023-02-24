import axios from 'axios';
import qs from 'qs';
import { ApiGeneralError } from '../errors/api-error';
import { getLogger } from '../utils/logger';

type IDIRAttributes = {
  idir_user_guid: [string];
  idir_username: [string];
  display_name: [string];
  given_name: [string];
  family_name: [string];
};

interface BCEIDBasicAttributes {
  bceid_user_guid: [string];
  bceid_username: [string];
}

type BCEIDBusinessAttributes = BCEIDBasicAttributes & {
  bceid_business_guid: [string];
  bceid_business_name: [string];
  display_name: [string];
};

interface KeycloakGetUserResponse {
  users: KeycloakUser[];
  roles: Record<string, string>[];
}

export type KeycloakUser = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  attributes: IDIRAttributes | BCEIDBusinessAttributes;
};

const defaultLog = getLogger('services/keycloak-service');

/**
 * Service for calling the keycloak admin API.
 *
 * Keycloak Documentation (select version and see `Administration REST API` section):
 * - https://www.keycloak.org/documentation-archive.html
 *
 * @export
 * @class KeycloakService
 */
export class KeycloakService {
  keycloakTokenHost: string;
  keycloakApiHost: string;
  keycloakIntegrationId: string;
  keycloakEnvironment: string;

  constructor() {
    this.keycloakTokenHost = `${process.env.KEYCLOAK_HOST}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    this.keycloakApiHost = `${process.env.KEYCLOAK_API_HOST}`;
    this.keycloakIntegrationId = `${process.env.KEYCLOAK_INTEGRATION_ID}`;
    this.keycloakEnvironment = `${process.env.KEYCLOAK_ENVIRONMENT}`;
  }

  /**
   * Get an access token from keycloak for the service account user.
   *
   * @return {*}  {Promise<string>}
   * @memberof KeycloakService
   */
  async getKeycloakToken(): Promise<string> {
    defaultLog.debug({ label: 'getKeycloakToken', keycloakTokenHost: this.keycloakTokenHost });

    try {
      const { data } = await axios.post(
        this.keycloakTokenHost,
        qs.stringify({
          grant_type: 'client_credentials',
          client_id: process.env.KEYCLOAK_ADMIN_USERNAME,
          client_secret: process.env.KEYCLOAK_ADMIN_PASSWORD
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
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
      const { data } = await axios.get<KeycloakGetUserResponse>(
        `${this.keycloakApiHost}/integrations/${this.keycloakIntegrationId}/${
          this.keycloakEnvironment
        }/user-role-mappings?${qs.stringify({ username })}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (!data.users.length) {
        throw new ApiGeneralError('Found no matching keycloak users');
      }

      if (data.users.length !== 1) {
        throw new ApiGeneralError('Found too many matching keycloak users');
      }

      return {
        username: data.users[0].username,
        email: data.users[0].email,
        firstName: data.users[0].firstName,
        lastName: data.users[0].lastName,
        attributes: data.users[0].attributes
      };
    } catch (error) {
      throw new ApiGeneralError('Failed to get user info from keycloak', [(error as Error).message]);
    }
  }
}
