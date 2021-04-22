import { AxiosInstance } from 'axios';
import { IAccessRequestResponse, IHasPendingAccessRequestResponse } from 'interfaces/useAdministrativeActivityApi.interface';

/**
 * Returns a set of supported api methods for working with access requests.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAdministrativeActivityApi = (axios: AxiosInstance) => {
  /**
   * Create a new access request record.
   *
   * @param {unknown} administrativeActivityData
   * @return {*}  {Promise<IAccessRequestResponse>}
   */
  const createAdministrativeActivity = async (administrativeActivityData: unknown): Promise<IAccessRequestResponse> => {
    const { data } = await axios.post('/api/administrative-activity', administrativeActivityData);

    return data;
  };

  /**
   * Has pending access requests.
   *
   * @return {*}  {Promise<string>}
   */
  const hasPendingAdministrativeActivities = async (): Promise<string> => {
    const { hasPending } = await axios.get('/api/administrative-activity', {}) as IHasPendingAccessRequestResponse;

    console.log ('hasPending in useAdministrativeActivityApi', hasPending);

    return hasPending;
  };

  return {
    createAdministrativeActivity,
    hasPendingAdministrativeActivities
  };
};

export default useAdministrativeActivityApi;
