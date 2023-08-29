import { AxiosInstance } from 'axios';

const useMarkings = (axios: AxiosInstance) => {
  const getAllMarkings = async (): Promise<Record<string, unknown>[]> => {
    const { data } = await axios.get('/api/markings');
    return data;
  };

  return {
    getAllMarkings
  };
};

export { useMarkings };
