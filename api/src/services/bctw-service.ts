import axios from 'axios';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { KeycloakService } from './keycloak-service';

export interface IDeployDevice {
  device_id: string;
  frequency: number;
  manufacturer: string;
  model: string;
  attachment_start: string;
  attachment_end: string;
  critter_id: string;
}

export interface IDeploymentUpdate {
  deployment_id: string;
  attachment_start: string;
  attachment_end: string;
}

export interface IDeploymentRecord {
  assignment_id: string;
  collar_id: string;
  critter_id: string;
  created_at: string;
  created_by_user_id: string;
  updated_at: string;
  updated_by_user_id: string;
  valid_from: string;
  valid_to: string;
  attachment_start: string;
  attachment_end: string;
  deployment_id: number;
}

export interface IBctwUser {
  keycloak_guid: string;
  username: string;
}

const BCTW_API_HOST = process.env.BCTW_API_HOST || '';
const DEPLOY_DEVICE_ENDPOINT = '/deploy-device';
const GET_DEPLOYMENTS_ENDPOINT = '/get-deployments';
const UPDATE_DEPLOYMENT_ENDPOINT = '/update-deployment';
const GET_COLLAR_VENDORS_ENDPOINT = '/get-collar-vendors';
const HEALTH_ENDPOINT = '/health';

export class BctwService {
  user: IBctwUser;
  keycloak: KeycloakService;

  constructor(user: IBctwUser) {
    this.user = user;
    this.keycloak = new KeycloakService();
  }

  /**
   * Return user information as a JSON string.
   *
   * @return {*}  {{ user: string }}
   * @memberof BctwService
   */
  getUserHeader(): { user: string } {
    return { user: JSON.stringify(this.user) };
  }

  /**
   * Retrieve an authentication token using Keycloak service.
   *
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async getToken(): Promise<string> {
    const token = await this.keycloak.getKeycloakServiceToken();
    return token;
  }

  /**
   * Send an authorized request to the BCTW API.
   *
   * @param {('get' | 'post' | 'patch' | 'delete')} method
   * @param {string} endpoint
   * @param {*} [data]
   * @return {*}
   * @memberof BctwService
   */
  async makeRequest(method: 'get' | 'post' | 'patch', endpoint: string, data?: any) {
    const url = `${BCTW_API_HOST}${endpoint}`;
    const token = await this.getToken();
    const response = await axios[method](url, data, {
      headers: {
        authorization: `Bearer ${token}`,
        ...this.getUserHeader()
      }
    });
    if (!response.data || response.status >= 400) {
      throw new ApiError(ApiErrorType.UNKNOWN, `API request to ${endpoint} failed`);
    }
    return response.data;
  }

  /**
   * Create a new deployment for a telemetry device on a critter.
   *
   * @param {IDeployDevice} device
   * @return {*}  {Promise<IDeploymentRecord>}
   * @memberof BctwService
   */
  async deployDevice(device: IDeployDevice): Promise<IDeploymentRecord> {
    return this.makeRequest('post', DEPLOY_DEVICE_ENDPOINT, device);
  }

  /**
   * Get all existing deployments.
   *
   * @return {*}  {Promise<IDeploymentRecord[]>}
   * @memberof BctwService
   */
  async getDeployments(): Promise<IDeploymentRecord[]> {
    return this.makeRequest('get', GET_DEPLOYMENTS_ENDPOINT);
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {IDeploymentUpdate} deployment
   * @return {*}  {Promise<IDeploymentRecord>}
   * @memberof BctwService
   */
  async updateDeployment(deployment: IDeploymentUpdate): Promise<IDeploymentRecord> {
    return this.makeRequest('patch', UPDATE_DEPLOYMENT_ENDPOINT, deployment);
  }

  /**
   * Get a list of all supported collar vendors.
   *
   * @return {*}  {Promise<string[]>}
   * @memberof BctwService
   */
  async getCollarVendors(): Promise<string[]> {
    return this.makeRequest('get', GET_COLLAR_VENDORS_ENDPOINT);
  }

  /**
   * Get the health of the platform.
   *
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async getHealth(): Promise<string> {
    return this.makeRequest('get', HEALTH_ENDPOINT);
  }
}
