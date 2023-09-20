import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import FormData from 'form-data';
import { URLSearchParams } from 'url';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { HTTP500 } from '../errors/http-error';
import { KeycloakService } from './keycloak-service';

export const IDeployDevice = z.object({
  device_id: z.number(),
  frequency: z.number().optional(),
  frequency_unit: z.string().optional(),
  device_make: z.string().optional(),
  device_model: z.string().optional(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  critter_id: z.string()
});

export type IDeployDevice = z.infer<typeof IDeployDevice>;

export type IDevice = Omit<IDeployDevice, 'attachment_start' | 'attachment_end' | 'critter_id'> & { collar_id: string };

export const IDeploymentUpdate = z.object({
  deployment_id: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string()
});

export type IDeploymentUpdate = z.infer<typeof IDeploymentUpdate>;

export const IDeploymentRecord = z.object({
  assignment_id: z.string(),
  collar_id: z.string(),
  critter_id: z.string(),
  created_at: z.string(),
  created_by_user_id: z.string(),
  updated_at: z.string(),
  updated_by_user_id: z.string(),
  valid_from: z.string(),
  valid_to: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string(),
  deployment_id: z.string(),
  device_id: z.number()
});

export type IDeploymentRecord = z.infer<typeof IDeploymentRecord>;

export const IUploadKeyxResponse = z.object({
  errors: z.array(
    z.object({
      row: z.string(),
      error: z.string(),
      rownum: z.number()
    })
  ),
  results: z.array(
    z.object({
      idcollar: z.number(),
      comtype: z.string(),
      idcom: z.string(),
      collarkey: z.string(),
      collartype: z.number(),
      dtlast_fetch: z.string().nullable()
    })
  )
});

export type IUploadKeyxResponse = z.infer<typeof IUploadKeyxResponse>;

export const IBctwUser = z.object({
  keycloak_guid: z.string(),
  username: z.string()
});

interface ICodeResponse {
  code_header_title: string;
  code_header_name: string;
  id: number;
  code: string;
  description: string;
  long_description: string;
}

export type IBctwUser = z.infer<typeof IBctwUser>;

export const BCTW_API_HOST = process.env.BCTW_API_HOST || '';
export const DEPLOY_DEVICE_ENDPOINT = '/deploy-device';
export const UPSERT_DEVICE_ENDPOINT = '/upsert-collar';
export const GET_DEPLOYMENTS_ENDPOINT = '/get-deployments';
export const GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT = '/get-deployments-by-critter-id';
export const GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT = '/get-deployments-by-device-id';
export const UPDATE_DEPLOYMENT_ENDPOINT = '/update-deployment';
export const GET_COLLAR_VENDORS_ENDPOINT = '/get-collar-vendors';
export const HEALTH_ENDPOINT = '/health';
export const GET_CODE_ENDPOINT = '/get-code';
export const GET_DEVICE_DETAILS = '/get-collar-history-by-device/';
export const UPLOAD_KEYX_ENDPOINT = '/import-xml';

export class BctwService {
  user: IBctwUser;
  keycloak: KeycloakService;
  axiosInstance: AxiosInstance;

  constructor(user: IBctwUser) {
    this.user = user;
    this.keycloak = new KeycloakService();
    this.axiosInstance = axios.create({
      headers: {
        user: this.getUserHeader()
      },
      baseURL: BCTW_API_HOST
    });

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error?.code === 'ECONNREFUSED') {
          return Promise.reject(
            new HTTP500('Connection to the BCTW API server was refused. Please try again later.', [error?.message])
          );
        }

        return Promise.reject(
          new ApiError(
            ApiErrorType.UNKNOWN,
            `API request failed with status code ${error?.response?.status}`,
            error?.request?.data
          )
        );
      }
    );

    // Async request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        config.headers['Authorization'] = `Bearer ${token}`;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
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
   * Send an authorized get request to the BCTW API.
   *
   * @param {string} endpoint
   * @param {Record<string, string>} [queryParams] - An object containing query parameters as key-value pairs
   * @return {*}
   * @memberof BctwService
   */
  async _makeGetRequest(endpoint: string, queryParams?: Record<string, string | string[]>) {
    let url = endpoint;
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }
    const response = await this.axiosInstance.get(url);
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
    return await this.axiosInstance.post(DEPLOY_DEVICE_ENDPOINT, device);
  }

  /**
   * Update device hardware details in BCTW.
   *
   * @param {IDevice} device
   * @returns {*} {IDevice}
   * @memberof BctwService
   */
  async updateDevice(device: IDevice): Promise<IDevice> {
    const { data } = await this.axiosInstance.post(UPSERT_DEVICE_ENDPOINT, device);
    if (data.errors.length) {
      throw Error(JSON.stringify(data.errors));
    }
    return data;
  }

  /**
   * Get device hardware details by device id.
   *
   * @param deviceId
   * @returns {*} {Promise<IDevice[]>}
   * @memberof BctwService
   */
  async getDeviceDetails(deviceId: number): Promise<IDevice[]> {
    return this._makeGetRequest(`${GET_DEVICE_DETAILS}${deviceId}`);
  }

  /**
   * Get deployments by device id, may return results for multiple critters.
   *
   * @param {number} deviceId
   * @returns {*} {Promise<IDeploymentRecord[]>}
   * @memberof BctwService
   */
  async getDeviceDeployments(deviceId: number): Promise<IDeploymentRecord[]> {
    return await this._makeGetRequest(GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT, { device_id: String(deviceId) });
  }

  /**
   * Get all existing deployments.
   *
   * @return {*}  {Promise<IDeploymentRecord[]>}
   * @memberof BctwService
   */
  async getDeployments(): Promise<IDeploymentRecord[]> {
    return this._makeGetRequest(GET_DEPLOYMENTS_ENDPOINT);
  }

  /**
   * Get all existing deployments for a list of critter IDs.
   *
   * @param {string[]} critter_ids
   * @return {*}  {Promise<IDeploymentRecord[]>}
   * @memberof BctwService
   */
  async getDeploymentsByCritterId(critter_ids: string[]): Promise<IDeploymentRecord[]> {
    const query = { critter_ids: critter_ids };
    return this._makeGetRequest(GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT, query);
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {IDeploymentUpdate} deployment
   * @return {*}  {Promise<IDeploymentRecord>}
   * @memberof BctwService
   */
  async updateDeployment(deployment: IDeploymentUpdate): Promise<IDeploymentRecord> {
    return await this.axiosInstance.patch(UPDATE_DEPLOYMENT_ENDPOINT, deployment);
  }

  /**
   * Get a list of all supported collar vendors.
   *
   * @return {*}  {Promise<string[]>}
   * @memberof BctwService
   */
  async getCollarVendors(): Promise<string[]> {
    return this._makeGetRequest(GET_COLLAR_VENDORS_ENDPOINT);
  }

  /**
   * Get the health of the platform.
   *
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async getHealth(): Promise<string> {
    return this._makeGetRequest(HEALTH_ENDPOINT);
  }

  /**
   * Upload a single or multiple zipped keyX files to the BCTW API.
   *
   * @param {Express.Multer.File} keyX
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async uploadKeyX(keyX: Express.Multer.File) {
    const formData = new FormData();
    formData.append('xml', keyX.buffer, keyX.originalname);
    const config = {
      headers: {
        ...formData.getHeaders()
      }
    };
    const response = await this.axiosInstance.post(UPLOAD_KEYX_ENDPOINT, formData, config);
    const data: IUploadKeyxResponse = response.data;
    if (data.errors.length) {
      const actualErrors: string[] = [];
      for (const error of data.errors) {
        // Ignore errors that indicate that a keyX already exists
        if (!error.error.endsWith('already exists')) {
          actualErrors.push(error.error);
        }
      }
      if (actualErrors.length) {
        throw new ApiError(ApiErrorType.UNKNOWN, 'API request failed with errors', actualErrors);
      }
    }
    return {
      totalKeyxFiles: data.results.length + data.errors.length,
      newRecords: data.results.length,
      existingRecords: data.errors.length
    };
  }

  /**
   * Get a list of all BCTW codes with a given header name.
   *
   * @param {string} codeHeaderName
   * @return {*}  {Promise<ICodeResponse[]>}
   * @memberof BctwService
   */
  async getCode(codeHeaderName: string): Promise<ICodeResponse[]> {
    return this._makeGetRequest(GET_CODE_ENDPOINT, { codeHeader: codeHeaderName });
  }
}
