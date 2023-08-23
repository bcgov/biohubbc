import axios, { AxiosResponse } from 'axios';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { KeycloakService } from './keycloak-service';
import { URLSearchParams } from 'url';

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

export const BCTW_API_HOST = process.env.BCTW_API_HOST || '';
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
   * @return {*}  {string}
   * @memberof BctwService
   */
  getUserHeader(): string {
    return JSON.stringify(this.user);
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
   * Throw an error if the request to the BCTW API fails.
   *
   * @param {AxiosResponse<any>} response
   * @param {string} endpoint
   * @memberof BctwService
   */
  handleRequestError(response: AxiosResponse<any>, endpoint: string) {
    if (!response.data || response.status >= 400) {
      throw new ApiError(ApiErrorType.UNKNOWN, `API request to ${endpoint} failed with status code ${response.status}`);
    }
  }

  /**
   * Send an authorized get request to the BCTW API.
   *
   * @param {string} endpoint
   * @param {Record<string, string>} [queryParams] - An object containing query parameters as key-value pairs
   * @return {*}
   * @memberof BctwService
   */
  async makeGetRequest(endpoint: string, queryParams?: Record<string, string>) {
    let url = `${BCTW_API_HOST}${endpoint}`;
    const token = await this.getToken();

    // If query parameters are provided, append them to the URL
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        authorization: `Bearer ${token}`,
        user: this.getUserHeader()
      }
    });

    this.handleRequestError(response, url);
    return response.data;
  }

  /**
   * Send an authorized post or patch request to the BCTW API.
   *
   * @param {('post' | 'patch')} method
   * @param {string} endpoint
   * @param {*} [data]
   * @return {*}
   * @memberof BctwService
   */
  async makePostPatchRequest(method: 'post' | 'patch', endpoint: string, data?: any) {
    const url = `${BCTW_API_HOST}${endpoint}`;
    const token = await this.getToken();
    const response = await axios[method](url, data, {
      headers: {
        authorization: `Bearer ${token}`,
        user: this.getUserHeader()
      }
    });
    this.handleRequestError(response, url);
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
    return this.makePostPatchRequest('post', DEPLOY_DEVICE_ENDPOINT, device);
  }

  /**
   * Get all existing deployments.
   *
   * @return {*}  {Promise<IDeploymentRecord[]>}
   * @memberof BctwService
   */
  async getDeployments(): Promise<IDeploymentRecord[]> {
    return this.makeGetRequest(GET_DEPLOYMENTS_ENDPOINT);
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {IDeploymentUpdate} deployment
   * @return {*}  {Promise<IDeploymentRecord>}
   * @memberof BctwService
   */
  async updateDeployment(deployment: IDeploymentUpdate): Promise<IDeploymentRecord> {
    return this.makePostPatchRequest('patch', UPDATE_DEPLOYMENT_ENDPOINT, deployment);
  }

  /**
   * Get a list of all supported collar vendors.
   *
   * @return {*}  {Promise<string[]>}
   * @memberof BctwService
   */
  async getCollarVendors(): Promise<string[]> {
    return this.makeGetRequest(GET_COLLAR_VENDORS_ENDPOINT);
  }

  /**
   * Get the health of the platform.
   *
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async getHealth(): Promise<string> {
    return this.makeGetRequest(HEALTH_ENDPOINT);
  }
}
