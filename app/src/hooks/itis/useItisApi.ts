import useAxios from 'hooks/api/useAxios';

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
  id: number;
  label: string;
  scientificName: string;
}

export const ITIS_SOLR_PARAMS = {
  SORT: 'wt=json&sort=nameWOInd+asc&rows=25',
  FILTER: 'omitHeader=true&fl=tsn+scientificName:nameWOInd+kingdom+parentTSN+commonNames:vernacular+updateDate+usage'
};

const useItisApi = () => {
  const apiAxios = useAxios(process.env.REACT_APP_ITIS_SOLR_URL);

  /**
   * Returns the ITIS search species Query.
   *
   * @param {*} searchTerm
   * @return {*}  {(Promise<IItisSearchResult[] | undefined>)}
   * @memberof TaxonomyService
   */
  const itisSearch = async (searchTerm: string): Promise<IItisSearchResult[] | undefined> => {
    try {
      const itisClient = getItisSearchUrl(searchTerm);

      const response = await apiAxios.get(itisClient);

      if (!response.data || !response.data.response || !response.data.response.docs) {
        return [];
      }

      return sanitizeItisData(response.data.response.docs);
    } catch (error) {
      new Error('Error searching ITIS.');
    }
  };

  /**
   * Returns the ITIS search URL.
   *
   * @param {string} searchSpecies
   * @return {*}  {Promise<string>}
   * @memberof ESService
   */
  const getItisSearchUrl = (searchSpecies: string): string => {
    const itisSearchSpecies = `q=(nameWOInd:*${searchSpecies}*+AND+usage:/(valid|accepted)/)+(vernacular:*${searchSpecies}*+AND+usage:/(valid|accepted)/)`;
    return `?${ITIS_SOLR_PARAMS.SORT}&${itisSearchSpecies}&${ITIS_SOLR_PARAMS.FILTER}`;
  };

  /**
   * Sanitize ITIS search results.
   *
   * @param {IItisSearchResponse[]} data
   * @return {*}  {IItisSearchResult[]}
   */
  const sanitizeItisData = (data: IItisSearchResponse[]): IItisSearchResult[] => {
    return data.map((item: IItisSearchResponse) => {
      const commonName = (item.commonNames && item.commonNames[0].split('$')[1]) || item.scientificName;

      return {
        id: Number(item.tsn),
        label: commonName,
        scientificName: item.scientificName
      };
    });
  };

  return {
    itisSearch,
    getItisSearchUrl,
    sanitizeItisData
  };
};

export default useItisApi;
