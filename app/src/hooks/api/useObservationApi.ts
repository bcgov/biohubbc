import { AxiosInstance } from 'axios';
import { IObservationRecord, IObservationTableRow } from 'contexts/observationsContext';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';

/**
 * Returns a set of supported api methods for working with observations.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationApi = (axios: AxiosInstance) => {
  /**
   * Insert/updates all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IObservationTableRow[]} surveyObservations
   * @return {*}
   */
  const insertUpdateObservationRecords = async (
    projectId: number,
    surveyId: number,
    surveyObservations: IObservationTableRow[]
  ): Promise<IObservationRecord[]> => {
    const { data } = await axios.put<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations`,
      { surveyObservations }
    );

    return data.surveyObservations;
  };

  /**
   * Retrieves all survey observation records for the given survey
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<IObservationTableRow[]>}
   */
  const getObservationRecords = async (
    projectId: number,
    surveyId: number
  ): Promise<IGetSurveyObservationsResponse> => {
    const { data } = await axios.get<IGetSurveyObservationsResponse>(
      `/api/project/${projectId}/survey/${surveyId}/observations`
    );

    return data;
  };

  return {
    insertUpdateObservationRecords,
    getObservationRecords
  };
};

export default useObservationApi;
