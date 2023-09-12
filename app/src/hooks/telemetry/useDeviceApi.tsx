import { AxiosInstance } from 'axios';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/animal';

interface ICodeResponse {
  code_header_title: string;
  code_header_name: string;
  id: number;
  code: string;
  description: string;
  long_description: string;
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

  interface IGetDeviceDetailsResponse {
    device: Record<string, unknown> | undefined;
    deployments: Omit<IAnimalDeployment, 'device_id'>[];
  }

  /**
   * Returns details for a given device.
   *
   * @param {number} deviceId
   * @return {*}  {Promise<IGetDeviceDetailsResponse>}
   */
  const getDeviceDetails = async (deviceId: number): Promise<IGetDeviceDetailsResponse> => {
    try {
      const { data } = await axios.get(`/api/telemetry/device/${deviceId}`);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return { device: undefined, deployments: [] };
  };

  return {
    getDeviceDetails,
    getCollarVendors,
    getCodeValues
  };
};

export { useDeviceApi };
