import { AxiosInstance } from 'axios';

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
   * @return {*}  {Promise<IListResourcesResponse>}
   */
  const publishSurvey = async (projectId: number, surveyId: number, dataSubmission: any): Promise<{ uuid: string }> => {
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
