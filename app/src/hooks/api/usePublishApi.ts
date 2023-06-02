import { AxiosInstance } from 'axios';
import { IRemoveOrResubmitForm } from 'components/publish/components/RemoveOrResubmitForm';
import { IProjectSubmitForm, ISurveySubmitForm } from 'interfaces/usePublishApi.interface';

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
   * @param {number} projectId
   * @param {string} fileName
   * @param {string} parentName
   * @param {IRemoveOrResubmitForm} formValues
   * @param {string} path
   * @return {*}  {Promise<boolean>}
   */
  const resubmitAttachment = async (
    projectId: number,
    fileName: string,
    parentName: string,
    formValues: IRemoveOrResubmitForm,
    path: string
  ): Promise<boolean> => {
    const sendData = {
      projectId: projectId,
      fileName: fileName,
      parentName: parentName,
      formValues: formValues,
      path: path
    };

    const { data } = await axios.post('/api/publish/attachment/resubmit', sendData);

    return data;
  };

  return {
    publishSurvey,
    publishProject,
    resubmitAttachment
  };
};

export default usePublishApi;
