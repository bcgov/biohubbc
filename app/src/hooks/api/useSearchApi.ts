import { AxiosInstance } from 'axios';
import { Feature } from 'geojson';
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

  /**
   * Get survey occurrences based on survey ID
   *
   * @param {number} surveyId
   * @return {*}  {Promise<Feature[]>}
   */
  const getSurveyOccurrences = async (surveyId: number): Promise<Feature[]> => {
    const { data } = await axios.get(`/api/search/${surveyId}/occurrences`);

    return data;
  };

  return {
    getSearchResultsList,
    getSurveyOccurrences
  };
};

export default useSearchApi;
