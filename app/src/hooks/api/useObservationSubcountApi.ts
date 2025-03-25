import { AxiosInstance } from 'axios';

/**
 * Returns a set of supported api methods for working with observation subcounts.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useObservationSubcountApi = (axios: AxiosInstance) => {
  /**
   * Delete an observation subcount record.
   *
   * Note: An observation must have at least one subcount. If all subcount records are deleted, the observation record
   * will also be deleted.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} surveyObservationId
   * @param {number} observationSubcountId
   * @return {*}  {Promise<void>}
   */
  const deleteObservationSubcount = async (
    projectId: number,
    surveyId: number,
    surveyObservationId: number,
    observationSubcountId: number
  ): Promise<void> => {
    await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/observations/${surveyObservationId}/subcounts/${observationSubcountId}`
    );
  };

  return {
    deleteObservationSubcount
  };
};

export default useObservationSubcountApi;
