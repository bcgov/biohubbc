import useAxios from 'hooks/api/useAxios';
import { useConfigContext } from 'hooks/useContext';

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

export interface IItisSearchResult {
  tsn: number;
  label: string;
  scientificName: string;
}

const useItisApi = () => {
  const config = useConfigContext();
  const apiAxios = useAxios(config.BACKBONE_API_HOST);

  /**
   * Returns the ITIS search species Query.
   *
   * @param {*} searchTerm
   * @return {*}  {(Promise<IItisSearchResult[] | undefined>)}
   * @memberof TaxonomyService
   */
  const itisSearch = async (searchTerm: string): Promise<IItisSearchResult[] | undefined> => {
    try {
      const { data } = await apiAxios.get<{ searchResponse: IItisSearchResult[] }>(config.BIOHUB_TAXON_PATH, {
        params: {
          terms: searchTerm
        }
      });

      if (!data.searchResponse) {
        return [];
      }

      return data.searchResponse;
    } catch (error) {
      new Error('Error searching ITIS.');
    }
  };

  return {
    itisSearch
  };
};

export default useItisApi;
