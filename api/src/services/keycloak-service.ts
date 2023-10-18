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

interface KeycloakIDIRUserRecord {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  attributes: {
    idir_user_guid: string[];
    idir_username: string[];
    display_name: string[];
  };
}

interface KeycloakIDIRUserResponse {
  data: KeycloakIDIRUserRecord[];
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
 * Service for calling the Keycloak Gold Standard CSS API.
 *
 * API Swagger Doc: https://api.loginproxy.gov.bc.ca/openapi/swagger#/Users/get__environment__basic_business_bceid_users
 *
 * @export
 * @class KeycloakService
 */
export class KeycloakService {
  keycloakHost: string;

  // Used to authenticate with the SIMS Service Client
  keycloakServiceClientId: string;
  keycloakServiceClientSecret: string;

  // Used to authenticate with the SIMS CSS API
  keycloakApiTokenUrl: string;
  keycloakApiClientId: string;
  keycloakApiClientSecret: string;

  // Used to query the CSS API
  keycloakApiHost: string;
  keycloakApiEnvironment: string;

  constructor() {
    this.keycloakHost = `${process.env.KEYCLOAK_HOST}`;

    this.keycloakServiceClientId = `${process.env.KEYCLOAK_ADMIN_USERNAME}`;
    this.keycloakServiceClientSecret = `${process.env.KEYCLOAK_ADMIN_PASSWORD}`;

    this.keycloakApiTokenUrl = `${process.env.KEYCLOAK_API_TOKEN_URL}`;
    this.keycloakApiClientId = `${process.env.KEYCLOAK_API_CLIENT_ID}`;
    this.keycloakApiClientSecret = `${process.env.KEYCLOAK_API_CLIENT_SECRET}`;

    this.keycloakApiHost = `${process.env.KEYCLOAK_API_HOST}`;
    this.keycloakApiEnvironment = `${process.env.KEYCLOAK_API_ENVIRONMENT}`;
  }

  /**
   * Get an access token from keycloak for the SIMS Service account.
   *
   * @return {*}  {Promise<string>}
   * @memberof KeycloakService
   */
  async getKeycloakServiceToken(): Promise<string> {
    try {
      const { data } = await axios.post(
        `${this.keycloakHost}/realms/standard/protocol/openid-connect/token`,
        qs.stringify({
          grant_type: 'client_credentials',
          client_id: this.keycloakServiceClientId,
          client_secret: this.keycloakServiceClientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return data.access_token as string;
    } catch (error) {
      defaultLog.debug({ label: 'getKeycloakServiceToken', message: 'error', error: error });
      throw new ApiGeneralError('Failed to authenticate with keycloak', [(error as Error).message]);
    }
  }

  /**
   * Get an access token from keycloak for the sims-team account user.
   *
   * @return {*}  {Promise<string>}
   * @memberof KeycloakService
   */
  async getKeycloakCssApiToken(): Promise<string> {
    try {
      const { data } = await axios.post(
        this.keycloakApiTokenUrl,
        qs.stringify({
          grant_type: 'client_credentials',
          client_id: this.keycloakApiClientId,
          client_secret: this.keycloakApiClientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return data.access_token as string;
    } catch (error) {
      defaultLog.debug({ label: 'getKeycloakCssApiToken', message: 'error', error: error });
      throw new ApiGeneralError('Failed to authenticate with keycloak', [(error as Error).message]);
    }
  }

  /**
   * Search for keycloak IDIR users based on provided criteria.
   *
   * @param {string} username
   * @return {*}  {Promise<KeycloakIDIRUserRecord[]>}
   * @memberof KeycloakService
   */
  async findIDIRUsers(criteria: {
    firstName?: string;
    lastName?: string;
    email?: string;
    guid?: string;
  }): Promise<KeycloakIDIRUserRecord[]> {
    const token = await this.getKeycloakCssApiToken();

    try {
      const { data } = await axios.get<KeycloakIDIRUserResponse>(
        `${this.keycloakApiHost}/${this.keycloakApiEnvironment}/idir/users?${qs.stringify({ guid: criteria.guid })}`,
        {
          headers: { authorization: `Bearer ${token}` }
        }
      );

      if (!data) {
        throw new ApiGeneralError('Found no matching keycloak idir users');
      }

      return data.data;
    } catch (error) {
      defaultLog.debug({ label: 'getUserByUsername', message: 'error', error: error });
      throw new ApiGeneralError('Failed to get user info from keycloak', [(error as Error).message]);
    }
  }
}
