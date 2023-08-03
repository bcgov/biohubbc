import { AxiosInstance } from 'axios';

const useCritterApi = (axios: AxiosInstance) => {
  const getAllCritters = async (): Promise<Record<string, unknown>[]> => {
    try {
      const { data } = await axios.get('/api/critters');
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return [];
  };

  const getCritterByID = async (critter_id: string): Promise<Record<string, unknown>> => {
    try {
      const { data } = await axios.get('/api/critters/' + critter_id);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return {};
  };

  return {
    getCritterByID,
    getAllCritters
  };
};

export { useCritterApi };