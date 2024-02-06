import { AxiosInstance } from 'axios';
import { ITaxonomy } from 'hooks/itis/useItisApi';
import qs from 'qs';

const useTaxonomyApi = (axios: AxiosInstance) => {
  const getSpeciesFromIds = async (ids: number[]): Promise<ITaxonomy[]> => {
    const { data } = await axios.get<{ searchResponse: ITaxonomy[] }>(`/api/taxonomy/species/list`, {
      params: { ids: qs.stringify(ids) },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data.searchResponse;
  };

  return {
    getSpeciesFromIds
  };
};

export default useTaxonomyApi;
