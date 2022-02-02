import axios from 'axios';
import qs from 'qs';
import { ApiGeneralError } from '../errors/custom-error';

export class KeycloakService {
  keycloakAdminUrl: string;

  constructor() {
    this.keycloakAdminUrl = `${process.env.KEYCLOAK_HOST}/auth/admin/realms/${process.env.KEYCLOAK_REALM}`;

    console.log(process.env);
    console.log(this.keycloakAdminUrl);
  }

  async getKeycloakToken(): Promise<string> {
    try {
      const { data } = await axios.post(this.keycloakAdminUrl, qs.stringify({ grant_type: 'client_credentials' }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: process.env.KEYCLOAK_ADMIN_USERNAME as string,
          password: process.env.KEYCLOAK_ADMIN_PASSWORD as string
        }
      });

      return data.access_token as string;
    } catch (error) {
      throw new ApiGeneralError('Failed to authenticate with keycloak');
    }
  }

  async getUser(username: string) {
    const token = await this.getKeycloakToken();

    try {
      const { data } = await axios.get(`${this.keycloakAdminUrl}/users/?${qs.stringify({ username: username })}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      const user = {
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        active: data.enabled,
        username: data.username
      };

      console.log('=========================');
      console.log(user);
      console.log('=========================');
    } catch (error) {
      throw new ApiGeneralError('Failed to get user info from keycloak');
    }
  }
}
