import { AxiosInstance } from 'axios';
import { ITaxonomy } from 'hooks/itis/useItisApi';
import qs from 'qs';

const useTaxonomyApi = (axios: AxiosInstance) => {
  /**
   * TODO jsdoc
   *
   * @param {number[]} tsn
   * @return {*}  {Promise<ITaxonomy[]>}
   */
  const getSpeciesFromIds = async (tsns: number[]): Promise<ITaxonomy[]> => {
    const { data } = await axios.get<{ searchResponse: ITaxonomy[] }>(`/api/taxonomy/species/list`, {
      params: { tsn: qs.stringify(tsns) },
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
