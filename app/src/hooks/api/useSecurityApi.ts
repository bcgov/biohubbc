import { AxiosInstance } from 'axios';
import { AttachmentType } from 'constants/attachments';
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
   * TODO update to fetch a real list of reasons from endpoint, rather than the hardcoded values currently returned
   *
   * @return {*}  {Promise<SecurityReason[]>}
   */
  const getSecurityReasons = async (): Promise<SecurityReason[]> => {
    // const { data } = await axios.get<IGetSecurityReasonResponse>(`/api/security/reasons/get`);
    return [
      {
        security_reason_id: 1,
        category: 'category 1',
        reasonTitle: 'reason title 1',
        reasonDescription: 'reason description 1',
        expirationDate: null
      },
      {
        security_reason_id: 2,
        category: 'category 2',
        reasonTitle: 'reason title 2',
        reasonDescription: 'reason description 2',
        expirationDate: new Date().toISOString()
      },
      {
        security_reason_id: 3,
        category: 'category 3',
        reasonTitle: 'reason title 3',
        reasonDescription: 'reason description 3',
        expirationDate: new Date().toISOString()
      },
      {
        security_reason_id: 4,
        category: 'category 4',
        reasonTitle: 'reason title 4',
        reasonDescription: 'reason description 4',
        expirationDate: null
      }
    ];

    // return data.security_reasons;
  };

  const addSecurityReasons = async (securityIds: number[], attachmentIds: number[]): Promise<any> => {
    const { data } = await axios.post(`/api/project/{projectId}/attachments/security/add`, {
      security_ids: securityIds,
      attachment_ids: attachmentIds
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

  return {
    getSecurityReasons,
    addSecurityReasons,
    deleteProjectReportAttachmentSecurityReasons,
    deleteProjectAttachmentSecurityReasons,
    deleteSurveyReportAttachmentSecurityReasons,
    deleteSurveyAttachmentSecurityReasons
  };
};

export default useSecurityApi;
