import { AxiosInstance } from 'axios';
import { AttachmentType } from 'constants/attachments';
import { IAttachmentType } from 'features/projects/view/ProjectAttachments';
import { SecurityReason } from 'interfaces/useSecurityApi.interface';

/**
 * Returns a set of supported api methods for working with security related records.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSecurityApi = (axios: AxiosInstance) => {
  /**
   * Fetch a list of security reasons.
   *
   * @return {*}  {Promise<SecurityReason[]>}
   */
  const getSecurityReasons = async (): Promise<SecurityReason[]> => {
    const { data } = await axios.get<SecurityReason[]>(`/api/security/get`);
    return data;
  };

  const searchForSecurityReasons = async (ids: number[]): Promise<SecurityReason[]> => {
    const { data } = await axios.post<SecurityReason[]>(`/api/security/search`, {
      security_ids: ids
    });

    return data;
  };

  const addProjectSecurityReasons = async (
    projectId: number,
    securityIds: number[],
    attachments: IAttachmentType[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/security/add`, {
      security_ids: securityIds,
      attachments: attachments
    });

    return data;
  };

  const addSurveySecurityReasons = async (
    projectId: number,
    surveyId: number,
    securityIds: number[],
    attachments: IAttachmentType[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/attachments/security/add`, {
      security_ids: securityIds,
      attachments: attachments
    });

    return data;
  };

  /**
   * Remove array of security reasons from Project report attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {number[]} securityIds
   * @return {*}  {Promise<any>}
   */
  const deleteProjectReportAttachmentSecurityReasons = async (
    projectId: number,
    attachmentId: number,
    securityIds: number[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/${attachmentId}/security/delete`, {
      security_ids: securityIds,
      attachmentType: AttachmentType.REPORT
    });

    return data;
  };

  /**
   * Remove array of security reasons from Project attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {number[]} securityIds
   * @return {*}  {Promise<any>}
   */
  const deleteProjectAttachmentSecurityReasons = async (
    projectId: number,
    attachmentId: number,
    securityIds: number[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/${attachmentId}/security/delete`, {
      security_ids: securityIds,
      attachmentType: AttachmentType.OTHER
    });

    return data;
  };

  /**
   * Remove array of security reasons from Survey report attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {number[]} securityIds
   * @return {*}  {Promise<any>}
   */
  const deleteSurveyReportAttachmentSecurityReasons = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    securityIds: number[]
  ): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/security/delete`,
      {
        security_ids: securityIds,
        attachmentType: AttachmentType.REPORT
      }
    );

    return data;
  };

  /**
   * Remove array of security reasons from Survey attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @param {number[]} securityIds
   * @return {*}  {Promise<any>}
   */
  const deleteSurveyAttachmentSecurityReasons = async (
    projectId: number,
    surveyId: number,
    attachmentId: number,
    securityIds: number[]
  ): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/${attachmentId}/security/delete`,
      {
        security_ids: securityIds,
        attachmentType: AttachmentType.OTHER
      }
    );

    return data;
  };

  /**
   * Update Review Time for Project Report Attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const updateProjectReportAttachmentSecurityReviewTime = async (
    projectId: number,
    attachmentId: number
  ): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/attachments/${attachmentId}/security/review-time/update`,
      {
        attachmentType: AttachmentType.REPORT
      }
    );

    return data;
  };

  /**
   * Update Review Time for Project Attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const updateProjectAttachmentSecurityReviewTime = async (projectId: number, attachmentId: number): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/attachments/${attachmentId}/security/review-time/update`,
      {
        attachmentType: AttachmentType.OTHER
      }
    );

    return data;
  };

  /**
   * Update Review Time for Survey Report Attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const updateSurveyReportAttachmentSecurityReviewTime = async (
    projectId: number,
    attachmentId: number
  ): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/attachments/${attachmentId}/security/review-time/update`,
      {
        attachmentType: AttachmentType.REPORT
      }
    );

    return data;
  };

  /**
   * Update Review Time for Survey Attachment Id
   *
   * @param {number} projectId
   * @param {number} attachmentId
   * @return {*}  {Promise<any>}
   */
  const updateSurveyAttachmentSecurityReviewTime = async (projectId: number, attachmentId: number): Promise<any> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/attachments/${attachmentId}/security/review-time/update`,
      {
        attachmentType: AttachmentType.OTHER
      }
    );

    return data;
  };

  return {
    getSecurityReasons,
    addProjectSecurityReasons,
    addSurveySecurityReasons,
    searchForSecurityReasons,
    deleteProjectReportAttachmentSecurityReasons,
    deleteProjectAttachmentSecurityReasons,
    deleteSurveyReportAttachmentSecurityReasons,
    deleteSurveyAttachmentSecurityReasons,
    updateProjectReportAttachmentSecurityReviewTime,
    updateProjectAttachmentSecurityReviewTime,
    updateSurveyReportAttachmentSecurityReviewTime,
    updateSurveyAttachmentSecurityReviewTime
  };
};

export default useSecurityApi;
