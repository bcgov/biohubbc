import { AxiosInstance } from 'axios';
import { ISubmitSurvey } from 'components/publish/PublishSurveyDialog';
import { IProjectSubmitForm, ISubmissionHistoryRow } from 'interfaces/usePublishApi.interface';

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
    projectId: number,
    surveyId: number,
    dataSubmission: ISubmitSurvey
  ): Promise<{ submission_uuid: string }> => {
    const sendData = {
      projectId: projectId,
      surveyId: surveyId,
      data: dataSubmission
    };

    const { data } = await axios.post('/api/publish/survey', sendData);
    return data;
  };

  /**
   * Get survey publishable feature types.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<{ featureTypes: string[] }>}
   */
  const getSurveyPublishableFeatures = async (
    projectId: number,
    surveyId: number
  ): Promise<{ featureTypes: string[] }> => {
    const { data } = await axios.get<{ featureTypes: string[] }>(
      `/api/project/${projectId}/survey/${surveyId}/publish/features`
    );

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

  const getSubmissionHistory = async (
    projectId: number,
    surveyId: number,
    submissionId: string
  ): Promise<ISubmissionHistoryRow[]> => {
    const { data } = await axios.get<ISubmissionHistoryRow[]>(
      `/api/project/${projectId}/survey/${surveyId}/submission/${submissionId}/history`
    );
    return data;
  };

  const deleteSubmissionUpload = async (
    projectId: number,
    surveyId: number,
    submissionId: string,
    submissionUploadId: string
  ): Promise<void> => {
    await axios.delete(
      `/api/project/${projectId}/survey/${surveyId}/submission/${submissionId}/upload/${submissionUploadId}`
    );
  };

  return {
    publishSurveyData,
    getSurveyPublishableFeatures,
    publishProject,
    getSubmissionHistory,
    deleteSubmissionUpload
  };
};

export default usePublishApi;
