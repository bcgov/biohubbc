import { AxiosInstance } from 'axios';
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
    const { data } = await axios.get<any>(`/api/security/get`);
    return data;
  };

  const addSecurityReasons = async (
    projectId: number,
    securityIds: number[],
    attachmentIds: number[]
  ): Promise<any> => {
    const { data } = await axios.post(`/api/project/${projectId}/attachments/security/add`, {
      security_ids: securityIds,
      attachment_ids: attachmentIds
    });

    return data;
  };

  return {
    getSecurityReasons,
    addSecurityReasons
  };
};

export default useSecurityApi;
