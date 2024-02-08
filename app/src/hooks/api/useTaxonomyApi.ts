import { AxiosInstance } from 'axios';
import { useConfigContext } from 'hooks/useContext';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import qs from 'qs';
import useAxios from './useAxios';

const useTaxonomyApi = (axios: AxiosInstance) => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.BACKBONE_INTERNAL_API_HOST);

  /**
   * Searches for taxon records based on ITIS TSNs.
   *
   * @param {number[]} tsns
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

  /**
   * Search for taxon records by search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {(Promise<ITaxonomy[]>)}
   */
  const searchSpeciesByTerms = async (searchTerms: string[]): Promise<ITaxonomy[]> => {
    try {
      const { data } = await apiAxios.get<{ searchResponse: ITaxonomy[] }>(config.BIOHUB_TAXON_PATH, {
        params: { terms: searchTerms },
        paramsSerializer: (params) => {
          return qs.stringify(params, { arrayFormat: 'repeat' });
        }
      });

      if (!data.searchResponse) {
        return [];
      }

      return data.searchResponse;
    } catch (error) {
      throw new Error('Failed to fetch Taxon records.');
    }
  };

  return {
    getSpeciesFromIds,
    searchSpeciesByTerms
  };
};

export default useTaxonomyApi;
