import { AxiosInstance } from 'axios';
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

  const addSecurityReasons = async (
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

  return {
    getSecurityReasons,
    addSecurityReasons,
    searchForSecurityReasons
  };
};

export default useSecurityApi;
