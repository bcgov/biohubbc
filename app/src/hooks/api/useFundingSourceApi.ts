import { AxiosInstance } from 'axios';
import { FundingSourceData } from 'features/funding-sources/components/FundingSourceForm';
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

  const createFundingSource = async (fundingSource: FundingSourceData): Promise<IGetFundingSourcesResponse[]> => {
    const { data } = await axios.post('/api/funding-source', fundingSource);

    return data;
  };

  const updateFundingSource = async (fundingSource: FundingSourceData): Promise<IGetFundingSourcesResponse[]> => {
    const { data } = await axios.put(`/api/funding-source/${fundingSource.funding_source_id}`, fundingSource);

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

  /**
   * Get a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<IGetFundingSourcesResponse>}
   */
  const getFundingSource = async (fundingSourceId: number): Promise<IGetFundingSourcesResponse> => {
    const { data } = await axios.get(`/api/funding-sources/${fundingSourceId}`);

    return data;
  };

  /**
   * Create a new funding source.
   *
   * // TODO fill in request body and response type
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<unknown>}
   */
  const postFundingSource = async (): Promise<unknown> => {
    const { data } = await axios.post('/api/funding-sources', {});

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
  const deleteFundingSourceById = async (fundingSourceId: number): Promise<unknown> => {
    const { data } = await axios.delete(`/api/funding-sources/${fundingSourceId}`);

    return data;
  };

  /**
   * Update a single funding source.
   *
   * // TODO fill in request body and response type
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<unknown>}
   */
  const putFundingSourceById = async (fundingSourceId: number): Promise<unknown> => {
    const { data } = await axios.put(`/api/funding-sources/${fundingSourceId}`, {});

    return data;
  };

  return {
    getAllFundingSources,
    createFundingSource,
    updateFundingSource,
    hasFundingSourceNameBeenUsed,
    getFundingSource,
    deleteFundingSourceById,
    putFundingSourceById,
    postFundingSource
  };
};

export default useFundingSourceApi;
