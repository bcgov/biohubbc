// TODO: Add functions for all device-orient bctw routes (vendor lookup, device deployment, etc.);

import { AxiosInstance } from 'axios';
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
  return {
    getCollarVendors,
    getCodeValues
  };
};

export { useDeviceApi };
