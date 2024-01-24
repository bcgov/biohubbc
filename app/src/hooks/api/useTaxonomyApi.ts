import { AxiosInstance } from 'axios';
import { ITaxonomySearchResult } from 'interfaces/useTaxonomy.interface';
import qs from 'qs';

const useTaxonomyApi = (axios: AxiosInstance) => {
  const searchSpecies = async (value: string): Promise<ITaxonomySearchResult> => {
    const { data } = await axios.get<ITaxonomySearchResult>(`/api/taxonomy/species/search`, {
      params: { terms: value },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  const getSpeciesFromIds = async (ids: number[]): Promise<ITaxonomySearchResult> => {
    const { data } = await axios.get<ITaxonomySearchResult>(`/api/taxonomy/species/list`, {
      params: { ids: qs.stringify(ids) },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  const searchSpeciesItis = async (value: string): Promise<ITaxonomySearchResult> => {
    const { data } = await axios.get<ITaxonomySearchResult>(`/api/taxonomy/itis/search`, {
      params: { terms: value },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  return {
    searchSpecies,
    getSpeciesFromIds,
    searchSpeciesItis
  };
};

export default useTaxonomyApi;
