import { AxiosInstance } from 'axios';
import { Critter } from 'features/surveys/view/survey-animals/animal';

export interface ICritterSimpleResponse {
  critter_id: string;
  wlh_id: string;
  animal_id: string;
  sex: string;
  taxon: string;
  collection_units: {
    critter_collection_unit_id: string;
    category_name: string;
    unit_name: string;
    collection_unit_id: string;
    collection_category_id: string;
  }[];
  mortality_timestamp?: string;
}

const useCritterApi = (axios: AxiosInstance) => {
  const getAllCritters = async (): Promise<Record<string, unknown>[]> => {
    try {
      const { data } = await axios.get('/api/critter-data/critters');
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
      const { data } = await axios.get(`/api/critter-data/critters/${critter_id}`);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
    }
    return {};
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
    const { data } = await axios.post('/api/critter-data/critters', payload);
    return data;
  };
  interface IFilterBody {
    body: string[];
    negate?: boolean;
  }
  interface IFilterCritters {
    critter_ids?: IFilterBody;
    animal_ids?: IFilterBody;
    wlh_ids?: IFilterBody;
    collection_units?: IFilterBody;
    taxon_name_commons?: IFilterBody;
  }
  const filterCritters = async (critterFilter: IFilterCritters): Promise<ICritterSimpleResponse[]> => {
    const { data } = await axios.post('api/critter-data/critters/filter', critterFilter);
    return data;
  };

  return {
    getCritterByID,
    getAllCritters,
    createCritter,
    filterCritters
  };
};

export { useCritterApi };
