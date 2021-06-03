import { AxiosInstance } from 'axios';
import { IGetSearchResultsListResponse, ISearchResultsAdvancedFilterRequest } from 'interfaces/useSearchApi.interface';

/**
 * Returns a set of supported api methods for working with searching for results.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSearchApi = (axios: AxiosInstance) => {
  /**
   * Get search results list based on filter criteria
   *
   * @param {ISearchResultsAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetSearchResultsListResponse[]>}
   */
  const getSearchResultsList = async (
    filterFieldData: ISearchResultsAdvancedFilterRequest
  ): Promise<IGetSearchResultsListResponse[]> => {
    const { data } = await axios.post(`/api/search`, filterFieldData || {});

    return data;
  };

  return {
    getSearchResultsList
  };
};

export default useSearchApi;
