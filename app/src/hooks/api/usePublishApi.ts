import { AxiosInstance } from 'axios';
import { ISubmitSurvey } from 'components/publish/PublishSurveyDialog';

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
   * @param {string} surveyUUID
   * @param {number} surveyId
   * @param {ISubmitSurvey} dataSubmission
   * @return {*}  {Promise<{ submission_id: number }>}
   */
  const publishSurveyData = async (
    surveyId: number,
    dataSubmission: ISubmitSurvey
  ): Promise<{ submission_id: number }> => {
    const sendData = {
      surveyId: surveyId,
      data: dataSubmission
    };

    const { data } = await axios.post('/api/publish/survey', sendData);
    return data;
  };

  return {
    publishSurveyData
  };
};

export default usePublishApi;
