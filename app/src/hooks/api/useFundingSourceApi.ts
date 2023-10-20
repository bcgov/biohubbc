import { AxiosInstance } from 'axios';
import { IFundingSourceData } from 'features/funding-sources/components/FundingSourceForm';
import { IGetFundingSourceResponse, IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';

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

  /**
   * Checks if a name for a new funding source has already been used.
   * This will return true if the name has been used, otherwise it returns false
   *
   * @return {*}  {Promise<Boolean>}
   */
  const hasFundingSourceNameBeenUsed = async (name: string): Promise<boolean> => {
    const { data } = await axios.get('/api/funding-sources', {
      params: {
        name
      }
    });

    return data.length > 0;
  };

  const getFundingSources = async (name: string): Promise<IGetFundingSourcesResponse[]> => {
    const { data } = await axios.get('/api/funding-sources', {
      params: {
        name
      }
    });

    return data;
  };

  /**
   * Get a single funding source and its survey references.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<IGetFundingSourceResponse>}
   */
  const getFundingSource = async (fundingSourceId: number): Promise<IGetFundingSourceResponse> => {
    const { data } = await axios.get(`/api/funding-sources/${fundingSourceId}`);

    return data;
  };

  /**
   * Create a new funding source.
   *
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<unknown>}
   */
  const postFundingSource = async (fundingSource: IFundingSourceData): Promise<IGetFundingSourcesResponse[]> => {
    const { data } = await axios.post('/api/funding-sources', fundingSource);

    return data;
  };

  /**
   * Delete a single funding source.
   *
   * // TODO fill in response type
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<unknown>}
   */
  const deleteFundingSourceById = async (
    fundingSourceId: number
  ): Promise<Pick<IGetFundingSourcesResponse, 'funding_source_id'>> => {
    const { data } = await axios.delete(`/api/funding-sources/${fundingSourceId}`);
    return data;
  };

  /**
   * Update a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<Pick<IGetFundingSourcesResponse, 'funding_source_id'>>}
   */
  const putFundingSource = async (
    fundingSource: IFundingSourceData
  ): Promise<Pick<IGetFundingSourcesResponse, 'funding_source_id'>> => {
    const { data } = await axios.put(`/api/funding-sources/${fundingSource.funding_source_id}`, fundingSource);

    return data;
  };

  return {
    getAllFundingSources,
    hasFundingSourceNameBeenUsed,
    getFundingSource,
    deleteFundingSourceById,
    putFundingSource,
    postFundingSource,
    getFundingSources
  };
};

export default useFundingSourceApi;
