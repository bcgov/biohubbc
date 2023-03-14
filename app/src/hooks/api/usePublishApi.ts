import { AxiosInstance } from 'axios';
import { ISurveySubmitForm } from 'components/publish/SubmitSurvey';

/**
 * Returns a list of all resources
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const usePublishApi = (axios: AxiosInstance) => {
  /**
   * Publish Survey Data
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ISurveySubmitForm} dataSubmission
   * @return {*}  {Promise<{ uuid: string }>}
   */
  const publishSurvey = async (
    projectId: number,
    surveyId: number,
    dataSubmission: ISurveySubmitForm
  ): Promise<{ uuid: string }> => {
    const sendData = {
      projectId: projectId,
      surveyId: surveyId,
      data: dataSubmission
    };
    const { data } = await axios.post('/api/publish/survey', sendData);

    return data;
  };

  return {
    publishSurvey
  };
};

export default usePublishApi;
