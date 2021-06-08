import { AxiosInstance } from 'axios';
import { IGetSearchResultsResponse, ISearchResultsAdvancedFilterRequest } from 'interfaces/useSearchApi.interface';

/**
 * Returns a set of supported api methods for working with search functionality
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSearchApi = (axios: AxiosInstance) => {
  /**
   * Get search results (spatial) based on filter criteria
   *
   * @param {ISearchResultsAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetSearchResultsResponse[]>}
   */
  const getSearchResults = async (
    filterFieldData: ISearchResultsAdvancedFilterRequest
  ): Promise<IGetSearchResultsResponse[]> => {
    const { data } = await axios.post(`/api/search`, filterFieldData || {});

    return data;
  };

  return {
    getSearchResults
  };
};

export default useSearchApi;
