import { AxiosInstance } from 'axios';

const useMarkings = (axios: AxiosInstance) => {
  const getAllMarkings = async (): Promise<Record<string, unknown>[]> => {
    try {
      console.log(JSON.stringify(axios.defaults, null, 2));
      const { data } = await axios.get('/api/markings');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return [];
  };

  return {
    getAllMarkings
  };
};

export { useMarkings };
