import { AxiosInstance } from 'axios';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';

/**
 * Returns a set of supported api methods for working with funding sources.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useFundingSourceApi = (axios: AxiosInstance) => {
  /**
   * Get all funding sources.
   *
   * @return {*}  {Promise<IGetFundingSourcesResponse[]>}
   */
  const getAllFundingSources = async (): Promise<IGetFundingSourcesResponse[]> => {
    const { data } = await axios.get('/api/funding-sources');

    return data;
  };

  return {
    getAllFundingSources
  };
};

export default useFundingSourceApi;
