import { AxiosInstance } from 'axios';
import { Device, IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';

interface ICodeResponse {
  code_header_title: string;
  code_header_name: string;
  id: number;
  code: string;
  description: string;
  long_description: string;
}

export interface IGetDeviceDetailsResponse {
  device: Record<string, unknown> | undefined;
  keyXStatus: boolean;
  deployments: Omit<IAnimalDeployment, 'device_id'>[];
}

/**
 * Returns a set of functions for making device-related API calls.
 *
 * @param {AxiosInstance} axios
 * @return {*}
 */
const useDeviceApi = (axios: AxiosInstance) => {
  /**
   * Returns a list of supported collar vendors.
   *
   * @return {*}  {Promise<string[]>}
   */
  const getCollarVendors = async (): Promise<string[]> => {
    try {
      const { data } = await axios.get('/api/telemetry/vendors');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return [];
  };

  /**
   * Returns a list of code values for a given code header.
   *
   * @param {string} codeHeader
   * @return {*}  {Promise<ICodeResponse[]>}
   */
  const getCodeValues = async (codeHeader: string): Promise<ICodeResponse[]> => {
    try {
      const { data } = await axios.get(`/api/telemetry/code?codeHeader=${codeHeader}`);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return [];
  };

  /**
   * Returns details for a given device.
   *
   * @param {number} deviceId
   * @param {string} deviceMake
   * @return {*}  {Promise<IGetDeviceDetailsResponse>}
   */
  const getDeviceDetails = async (deviceId: number, deviceMake: string): Promise<IGetDeviceDetailsResponse> => {
    try {
      const { data } = await axios.get(`/api/telemetry/device/${deviceId}?make=${deviceMake}`);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return { device: undefined, keyXStatus: false, deployments: [] };
  };

  /**
   * Allows you to update a collar in bctw, invalidating the old record.
   * @param {Device} body
   * @returns {*}
   */
  const upsertCollar = async (body: Device): Promise<any> => {
    try {
      const { data } = await axios.post(`/api/telemetry/device`, body);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return {};
  };

  return {
    getDeviceDetails,
    getCollarVendors,
    getCodeValues,
    upsertCollar
  };
};

export { useDeviceApi };
