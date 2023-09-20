import { AxiosInstance } from 'axios';
import { ICreateSamplingSiteRequest } from 'features/surveys/observations/sampling-sites/SamplingSitePage';

/**
 * Returns a set of supported api methods for working with search functionality
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSamplingSiteApi = (axios: AxiosInstance) => {
  /**
   * Get search results (spatial)
   *
   * @return {*}  {Promise<IGetSearchResultsResponse[]>}
   */
  const createSamplingSite = async (samplingSite: ICreateSamplingSiteRequest): Promise<any> => {
    //TODO: hook this up with real API
    const { data } = await axios.post(`/api/search`, samplingSite);

    return data;
  };

  return {
    createSamplingSite
  };
};

export default useSamplingSiteApi;
