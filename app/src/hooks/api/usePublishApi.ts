import { AxiosInstance } from 'axios';
import { ISubmitSurvey } from 'components/publish/PublishSurveyDialog';
import { IProjectSubmitForm } from 'interfaces/usePublishApi.interface';

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

  /**
   * Publish Project Data
   *
   * @param {number} projectId
   * @param {IProjectSubmitForm} dataSubmission
   * @return {*}  {Promise<{ uuid: string }>}
   */
  const publishProject = async (projectId: number, dataSubmission: IProjectSubmitForm): Promise<{ uuid: string }> => {
    const sendData = {
      projectId: projectId,
      data: dataSubmission
    };

    const { data } = await axios.post('/api/publish/project', sendData);

    return data;
  };

  /**
   * [TEMPORARY] Soft-delete the survey submission (upload) on the BioHub backbone.
   * submissionId = survey_metadata_publish.submission_uuid.
   */
  const deleteSurveySubmission = async (projectId: number, surveyId: number): Promise<void> => {
    await axios.delete(`/api/project/${projectId}/survey/${surveyId}/submission`);
  };

  return {
    publishSurveyData,
    publishProject,
    deleteSurveySubmission
  };
};

export default usePublishApi;
