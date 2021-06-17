import { AxiosInstance } from 'axios';
import {
  IGetObservationsListResponse,
  ICreateBlockObservationPostRequest,
  ICreateBlockObservationPostResponse,
  IGetObservationResponse
} from 'interfaces/useObservationApi.interface';
import qs from 'qs';

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
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/observations/list`);

    return data;
  };
  /**
   * Create a new block observation
   *
   * @param {ICreateBlockObservationRequest} blockObservation
   * @return {*}  {Promise<ICreateBlockObservationResponse>}
   */
  const createBlockObservation = async (
    projectId: number,
    surveyId: number,
    blockObservation: ICreateBlockObservationPostRequest
  ): Promise<ICreateBlockObservationPostResponse> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/observations/create`,
      blockObservation
    );

    return data;
  };

  /**
   *Get details for a single observation for update purposes.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} observationId
   * @param {string} entity
   * @return {*}  {Promise<IGetObservationResponse>}
   */
  const getObservationForUpdate = async (
    projectId: number,
    surveyId: number,
    observationId: number,
    entity: string
  ): Promise<IGetObservationResponse> => {
    const { data } = await axios.get(
      `/api/project/${projectId}/survey/${surveyId}/observations/${observationId}/update`,
      {
        params: { entity },
        paramsSerializer: (params) => {
          return qs.stringify(params);
        }
      }
    );

    return data;
  };

  return {
    getObservationsList,
    createBlockObservation,
    getObservationForUpdate
  };
};

export default useObservationApi;
