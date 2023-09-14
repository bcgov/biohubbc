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
const useDeviceApi = (axios: AxiosInstance) => {
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

  const upsertCollar = async (body: any): Promise<any> => {
    try {
      const { data } = await axios.post(`/api/telemetry/collar`, body);
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
    getCodeValues
  };
};

export { useDeviceApi };
