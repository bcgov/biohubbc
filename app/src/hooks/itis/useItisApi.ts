import useAxios from 'hooks/api/useAxios';
import { useConfigContext } from 'hooks/useContext';
import qs from 'qs';

export interface IItisSearchResponse {
  commonNames: string[];
  kingdom: string;
  name: string;
  parentTSN: string;
  scientificName: string;
  tsn: string;
  updateDate: string;
  usage: string;
}

export interface ITaxonomy {
  tsn: number;
  commonName?: string;
  scientificName: string;
}

const useItisApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.BACKBONE_API_HOST);

  /**
   * Search for taxon records by search terms.
   *
   * @param {string[]} searchTerms
   * @return {*}  {(Promise<ITaxonomy[]>)}
   */
  const itisSearch = async (searchTerms: string[]): Promise<ITaxonomy[]> => {
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
    itisSearch
  };
};

export default useItisApi;
