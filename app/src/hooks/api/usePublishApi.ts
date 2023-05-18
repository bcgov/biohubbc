import { AxiosInstance } from 'axios';
import { IRemoveOrResubmitForm } from 'components/publish/components/RemoveOrResubmitForm';
import { IProjectSubmitForm } from 'components/publish/PublishProjectSections';
import { ISurveySubmitForm } from 'components/publish/PublishSurveySections';

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
   * @param {(IGetProjectAttachment | IGetSurveyAttachment)} file
   * @param {IRemoveOrResubmitForm} formValues
   * @param {string} path
   * @return {*}  {Promise<{ data: string }>}
   */
  const resubmitAttachment = async (
    fileName: string,
    parentName: string,
    formValues: IRemoveOrResubmitForm,
    path: string
  ): Promise<{ data: string }> => {
    const sendData = {
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
