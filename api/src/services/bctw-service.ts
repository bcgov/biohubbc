import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import FormData from 'form-data';
import { URLSearchParams } from 'url';
import { z } from 'zod';
import { ApiError, ApiErrorType } from '../errors/api-error';
import { HTTP500 } from '../errors/http-error';
import { GeoJSONFeatureCollectionZodSchema } from '../zod-schema/geoJsonZodSchema';
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

export const IKeyXDetails = z.object({
  device_id: z.number(),
  keyx: z
    .object({
      idcom: z.string(),
      comtype: z.string(),
      idcollar: z.number(),
      collarkey: z.string(),
      collartype: z.number()
    })
    .nullable()
});

export type IKeyXDetails = z.infer<typeof IKeyXDetails>;

export const IManualTelemetry = z.object({
  telemetry_manual_id: z.string().uuid(),
  deployment_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  date: z.string()
});

export type IManualTelemetry = z.infer<typeof IManualTelemetry>;

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

export type CritterTelemetryResponse = z.infer<typeof GeoJSONFeatureCollectionZodSchema>;

export type IBctwUser = z.infer<typeof IBctwUser>;

export const BCTW_API_HOST = process.env.BCTW_API_HOST || '';
export const DEPLOY_DEVICE_ENDPOINT = '/deploy-device';
export const UPSERT_DEVICE_ENDPOINT = '/upsert-collar';
export const GET_DEPLOYMENTS_ENDPOINT = '/get-deployments';
export const GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT = '/get-deployments-by-critter-id';
export const GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT = '/get-deployments-by-device-id';
export const UPDATE_DEPLOYMENT_ENDPOINT = '/update-deployment';
export const DELETE_DEPLOYMENT_ENDPOINT = '/delete-deployment';
export const GET_COLLAR_VENDORS_ENDPOINT = '/get-collar-vendors';
export const HEALTH_ENDPOINT = '/health';
export const GET_CODE_ENDPOINT = '/get-code';
export const GET_DEVICE_DETAILS = '/get-collar-history-by-device/';
export const UPLOAD_KEYX_ENDPOINT = '/import-xml';
export const GET_KEYX_STATUS_ENDPOINT = '/get-collars-keyx';
export const GET_TELEMETRY_POINTS_ENDPOINT = '/get-critters';
export const GET_TELEMETRY_TRACKS_ENDPOINT = '/get-critter-tracks';
export const MANUAL_TELEMETRY = '/manual-telemetry';
export const VENDOR_TELEMETRY = '/vendor-telemetry';
export const DELETE_MANUAL_TELEMETRY = '/manual-telemetry/delete';

export const getBctwUser = (req: Request): IBctwUser => ({
  keycloak_guid: req['system_user']?.user_guid,
  username: req['system_user']?.user_identifier
});

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
      baseURL: BCTW_API_HOST,
      timeout: 10000
    });

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (
          error?.code === 'ECONNREFUSED' ||
          error?.code === 'ECONNRESET' ||
          error?.code === 'ETIMEOUT' ||
          error?.code === 'ECONNABORTED'
        ) {
          return Promise.reject(
            new HTTP500('Connection to the BCTW API server was refused. Please try again later.', [error?.message])
          );
        }
        const data = error.response?.data;
        const errMsg = data?.error ?? data?.errors ?? data ?? 'Unknown error';

        return Promise.reject(
          new ApiError(
            ApiErrorType.UNKNOWN,
            `API request failed with status code ${error?.response?.status}, ${errMsg}`,
            Array.isArray(errMsg) ? errMsg : [errMsg]
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
    return this.axiosInstance.patch(UPDATE_DEPLOYMENT_ENDPOINT, deployment);
  }

  /**
   * Soft deletes the deployment in BCTW.
   *
   * @param {string} deployment_id uuid
   * @returns {*} {Promise<IDeploymentRecord>}
   * @memberof BctwService
   */
  async deleteDeployment(deployment_id: string): Promise<IDeploymentRecord> {
    return this.axiosInstance.delete(`${DELETE_DEPLOYMENT_ENDPOINT}/${deployment_id}`);
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

  async getKeyXDetails(deviceIds: number[]): Promise<IKeyXDetails[]> {
    return this._makeGetRequest(GET_KEYX_STATUS_ENDPOINT, { device_ids: deviceIds.map((id) => String(id)) });
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

  /**
   * Get all telemetry points for an animal.
   * The geometry will be points, and the properties will include the critter id and deployment id.
   * @param critterId uuid
   * @param startDate
   * @param endDate
   * @returns {*} CritterTelemetryResponse
   */
  async getCritterTelemetryPoints(
    critterId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CritterTelemetryResponse> {
    return this._makeGetRequest(GET_TELEMETRY_POINTS_ENDPOINT, {
      critter_id: critterId,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  /**
   * Get all telemetry tracks for an animal.
   * The geometry will be lines, and the properties will include the critter id and deployment id.
   * The lines are actually just generated on the fly by the the db using the same points as getCritterTelemetryPoints.
   *
   * @param critterId uuid
   * @param startDate
   * @param endDate
   * @returns {*} CritterTelemetryResponse
   */
  async getCritterTelemetryTracks(
    critterId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CritterTelemetryResponse> {
    return this._makeGetRequest(GET_TELEMETRY_TRACKS_ENDPOINT, {
      critter_id: critterId,
      start: startDate.toISOString(),
      end: endDate.toISOString()
    });
  }

  /**
   * Get all manual telemetry records
   * This set of telemetry is mostly useful for testing purposes.
   *
   * @returns {*} IManualTelemetry[]
   **/
  async getManualTelemetry(): Promise<IManualTelemetry[]> {
    return this._makeGetRequest(MANUAL_TELEMETRY);
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployment_id
   * @returns {*} IManualTelemetry[]
   */
  async getManualTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(`${MANUAL_TELEMETRY}/deployments`, deployment_ids);
    return res.data;
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployment_id
   * @returns {*} IManualTelemetry[]
   */
  async getVendorTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(`${VENDOR_TELEMETRY}/deployments`, deployment_ids);
    return res.data;
  }

  /**
   * Delete manual telemetry records by telemetry_manual_id
   * Note: This is a post request that accepts an array of ids
   * @param {uuid[]} telemetry_manaual_ids
   *
   * @returns {*} IManualTelemetry[]
   **/
  async deleteManualTelemetry(telemetry_manual_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(DELETE_MANUAL_TELEMETRY, telemetry_manual_ids);
    return res.data;
  }

  /**
   * Bulk create manual telemetry records
   * @param {Omit<IManualTelemetry, 'telemetry_manual_id'>} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async createManualTelemetry(payload: Omit<IManualTelemetry, 'telemetry_manual_id'>[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post(MANUAL_TELEMETRY, payload);
    return res.data;
  }

  /**
   * Bulk update manual telemetry records
   * @param {IManualTelemetry} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async updateManualTelemetry(payload: IManualTelemetry[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.patch(MANUAL_TELEMETRY, payload);
    return res.data;
  }
}
