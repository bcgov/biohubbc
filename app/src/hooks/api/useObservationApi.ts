import { AxiosInstance } from 'axios';
import {
  IGetObservationsListResponse,
  IObservationAdvancedFilterRequest
} from 'interfaces/useObservationApi.interface';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Get observations list (potentially based on filter criteria).
   *
   * @param {IObservationAdvancedFilterRequest} filterFieldData
   * @return {*}  {Promise<IGetObservationsListResponse[]>}
   */
  const getObservationsList = async (
    filterFieldData?: IObservationAdvancedFilterRequest
  ): Promise<IGetObservationsListResponse[]> => {
    const { data } = await axios.post(`/api/observations`, filterFieldData || {});

    return data;
  };

  return {
    getObservationsList
  };
};

export default useObservationApi;
