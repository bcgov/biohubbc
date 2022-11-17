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
        reasonTitle: 'reason title 1',
        reasonDescription: 'reason description 1',
        expirationDate: new Date().toISOString()
      },
      {
        security_reason_id: 3,
        category: 'category 3',
        reasonTitle: 'reason title 1',
        reasonDescription: 'reason description 1',
        expirationDate: new Date().toISOString()
      },
      {
        security_reason_id: 4,
        category: 'category 4',
        reasonTitle: 'reason title 1',
        reasonDescription: 'reason description 1',
        expirationDate: null
      }
    ];

    // return data.security_reasons;
  };

  return {
    getSecurityReasons
  };
};

export default useSecurityApi;
