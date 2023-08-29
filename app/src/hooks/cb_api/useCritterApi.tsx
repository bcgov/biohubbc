import { AxiosInstance } from 'axios';
import { Critter } from 'features/surveys/view/survey-animals/animal';

const useCritterApi = (axios: AxiosInstance) => {
  const getAllCritters = async (): Promise<Record<string, unknown>[]> => {
    const { data } = await axios.get('/api/critters');
    return data;
  };

  const getCritterByID = async (critter_id: string): Promise<Record<string, unknown>> => {
    const { data } = await axios.get('/api/critters/' + critter_id);
    return data;
  };

  const createCritter = async (critter: Critter): Promise<{ count: number }> => {
    const payload = {
      critters: [
        { critter_id: critter.critter_id, animal_id: critter.animal_id, sex: 'Unknown', taxon_id: critter.taxon_id }
      ],
      qualitative_measurements: critter.measurements.qualitative,
      quantitative_measurements: critter.measurements.quantitative,
      ...critter
    };
    const { data } = await axios.post('/api/bulk', payload);
    return data;
  };

  return {
    getCritterByID,
    getAllCritters,
    createCritter
  };
};

export { useCritterApi };
