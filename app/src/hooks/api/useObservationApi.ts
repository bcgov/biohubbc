import { AxiosInstance } from 'axios';
import { IGetObservationsListResponse } from 'interfaces/useObservationApi.interface';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Get observations list.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IGetObservationsListResponse>}
   */
  const getObservationsList = async (projectId: number, surveyId: number): Promise<IGetObservationsListResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/observations`);

    return data;
  };

  return {
    getObservationsList
  };
};

export default useObservationApi;
