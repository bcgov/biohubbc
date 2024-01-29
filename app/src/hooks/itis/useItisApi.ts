import { AxiosInstance } from 'axios';
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

export interface IItisSearchResult {
  id: number;
  label: string;
  scientificName: string;
}

export const ITIS_PARAMS = {
  SORT: 'wt=json&sort=nameWOInd+asc&rows=25',
  FILTER: 'omitHeader=true&fl=tsn+scientificName:nameWOInd+kingdom+parentTSN+commonNames:vernacular+updateDate+usage'
};

const useItisApi = (axios: AxiosInstance) => {
  /**
   * Returns the ITIS search species Query.
   *
   * @param {*} searchRequest
   * @return {*}  {(Promise<IItisSearchResult[] | undefined>)}
   * @memberof TaxonomyService
   */
  const itisSearch = async (searchRequest: string): Promise<IItisSearchResult[] | undefined> => {
    try {
      console.log('searchRequest', searchRequest);
      const itisClient = getItisSearchUrl(searchRequest);
      console.log('itisClient', itisClient);

      const response = await axios.get(itisClient);
      console.log('response', response);

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
    const itisUrl = process.env.REACT_APP_ITIS_URL;
    if (!itisUrl) {
      throw new Error('ITIS_SEARCH_URL not defined.');
    }
    const itisSearchSpecies = `q=(nameWOInd:*${searchSpecies}*+AND+usage:/(valid|accepted)/)+(vernacular:*${searchSpecies}*+AND+usage:/(valid|accepted)/)`;
    console.log('itisSearchSpecies', itisSearchSpecies);
    const url = `${itisUrl}?${ITIS_PARAMS.SORT}&${itisSearchSpecies}&${ITIS_PARAMS.FILTER}`;
    console.log('url', url);
    const qsdata = qs.stringify(url);
    console.log('qsdata', qsdata);
    return qsdata;
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
