import axios from 'axios';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { User } from '../models/user';
import { KeycloakService } from './keycloak-service';

export interface IDeployDevice {
  id: string;
  frequency: number;
  manufacturer: string;
  model: string;
  critter_id: string;
}

const getBctwApiHost = () => process.env.BCTW_API_HOST || '';

export class BctwService {
  user: User;

  constructor(user: User) {
    this.user = user;
  }

  // TODO: determine which exact user details should be included
  getUserHeader() {
    return { user: JSON.stringify(this.user) };
  }

  /**
   * Creates a device deployment in BCTW.
   *
   * @param {IDeployDevice} device
   * @return {*} {Promise<{ deployment_id: number }>}
   * @memberof BctwService
   */
  async deployDevice(device: IDeployDevice) {
    const token = await new KeycloakService().getKeycloakToken();
    const response = await axios.post(`${getBctwApiHost()}/deploy-device`, device, {
      headers: {
        authorization: `Bearer ${token}`,
        ...this.getUserHeader()
      }
    });
    if (!response.data) {
      throw new ApiError(ApiErrorType.UNKNOWN, 'Failed to deploy telemetry device to BCTW');
    }
    return response.data;
  }
}
