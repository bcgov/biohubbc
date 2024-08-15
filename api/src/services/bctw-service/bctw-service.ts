import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Request } from 'express';
import { ApiError, ApiErrorType } from '../../errors/api-error';
import { HTTP500 } from '../../errors/http-error';
import { IBctwUser, ICodeResponse } from '../../models/bctw';
import { KeycloakService } from '../keycloak-service';

export const getBctwUser = (req: Request): IBctwUser => ({
  keycloak_guid: req.system_user?.user_guid ?? '',
  username: req.system_user?.user_identifier ?? ''
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
      baseURL: process.env.BCTW_API_HOST || '',
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
        const data: any = error.response?.data;
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
   * Get the health of the platform.
   *
   * @return {*}  {Promise<string>}
   * @memberof BctwService
   */
  async getHealth(): Promise<string> {
    const { data } = await this.axiosInstance.get('/health');

    return data;
  }

  /**
   * Get a list of all BCTW codes with a given header name.
   *
   * @param {string} codeHeaderName
   * @return {*}  {Promise<ICodeResponse[]>}
   * @memberof BctwService
   */
  async getCode(codeHeaderName: string): Promise<ICodeResponse[]> {
    const { data } = await this.axiosInstance.get('/get-code', { params: { codeHeader: codeHeaderName } });

    return data;
  }
}
