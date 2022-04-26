import { AxiosInstance } from 'axios';
import qs from 'qs';

const useTaxonomyApi = (axios: AxiosInstance): any => {
  const searchSpecies = async (value: string): Promise<any> => {
    axios.defaults.params = { terms: value };

    const { data } = await axios.get(`/api/taxonomy/species/search`);

    return data;
  };

  const getSpeciesFromIds = async (value: number[]): Promise<any> => {
    axios.defaults.params = { ids: qs.stringify(value) };

    const { data } = await axios.get(`/api/taxonomy/species/list`);

    return data;
  };

  return {
    searchSpecies,
    getSpeciesFromIds
  };
};

export default useTaxonomyApi;
