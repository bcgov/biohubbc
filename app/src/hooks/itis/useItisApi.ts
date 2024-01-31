import { ConfigContext } from 'contexts/configContext';
import useAxios from 'hooks/api/useAxios';
import { useContext } from 'react';

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
  const config = useContext(ConfigContext);
  const apiAxios = useAxios(config?.BIOHUB_API_URL);

  /**
   * Returns the ITIS search species Query.
   *
   * @param {*} searchTerm
   * @return {*}  {(Promise<IItisSearchResult[] | undefined>)}
   * @memberof TaxonomyService
   */
  const itisSearch = async (searchTerm: string): Promise<IItisSearchResult[] | undefined> => {
    try {
      console.log('searchTerm', searchTerm);

      console.log('apiAxios', apiAxios);
      console.log('config?.BIOHUB_API_URL', config?.BIOHUB_API_URL);
      console.log('config?.BIOHUB_TAXON_PATH ', config?.BIOHUB_TAXON_PATH);

      const { data } = await apiAxios.get<{ searchResponse: IItisSearchResult[] }>(
        config?.BIOHUB_TAXON_PATH || '/api/taxonomy/taxon',
        {
          params: {
            terms: searchTerm
          }
        }
      );
      console.log('data', data);

      if (!data.searchResponse) {
        return [];
      }
      console.log('data.searchResponse', data.searchResponse);

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
