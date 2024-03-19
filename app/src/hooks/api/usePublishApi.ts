import { AxiosInstance } from 'axios';
import { IRemoveOrResubmitForm } from 'components/publish/components/RemoveOrResubmitForm';
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
   * Request Resubmit Attachment
   *
   * @param {number} projectId The project ID pertaining to the given artifact
   * @param {string} fileName The name of the artifact, such as the observation submission filename,
   * report name, summary results submission filename, etc.
   * @param {string} parentName The name of the parent artifact, namely the project name or
   * survey name
   * @param {IRemoveOrResubmitForm} formValues The particular form values to be review by the
   * administrator
   * @param {string} path The path to the particular artifact, e.g. '/api/projects/1'
   * @return {*}  {Promise<boolean>}
   */
  const resubmitAttachment = async (
    projectId: number,
    fileName: string,
    parentName: string,
    formValues: IRemoveOrResubmitForm,
    path: string
  ): Promise<boolean> => {
    const { data } = await axios.post('/api/publish/attachment/resubmit', {
      projectId,
      fileName,
      parentName,
      formValues,
      path
    });

    return data;
  };

  return {
    publishSurveyData,
    publishProject,
    resubmitAttachment
  };
};

export default usePublishApi;
