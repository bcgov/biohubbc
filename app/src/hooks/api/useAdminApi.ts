import { AxiosInstance } from 'axios';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import {
  IAccessRequestDataObject,
  IgcNotifyGenericMessage,
  IgcNotifyRecipient,
  IGetAccessRequestsListResponse,
  IGetAdministrativeActivityStanding
} from 'interfaces/useAdminApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for working with projects.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useAdminApi = (axios: AxiosInstance) => {
  /**
   * Send notification to recipient
   *
   * @param {IgcNotifyRecipient} recipient
   * @param {IgcNotifyGenericMessage} message
   * @return {*}  {Promise<number>}
   */
  const sendGCNotification = async (
    recipient: IgcNotifyRecipient,
    message: IgcNotifyGenericMessage
  ): Promise<boolean> => {
    const { status } = await axios.post(`/api/gcnotify/send`, {
      recipient,
      message
    });

    return status === 200;
  };

  /**
   * Get user access requests
   *
   * @param {AdministrativeActivityType[]} [type=[]]
   * @param {AdministrativeActivityStatusType[]} [status=[]]
   * @return {*}  {Promise<IGetAccessRequestsListResponse[]>}
   */
  const getAdministrativeActivities = async (
    type: AdministrativeActivityType[] = [],
    status: AdministrativeActivityStatusType[] = []
  ): Promise<IGetAccessRequestsListResponse[]> => {
    const { data } = await axios.get(`/api/administrative-activities`, {
      params: { type, status },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  const approveAccessRequest = async (
    administrativeActivityId: number,
    userData: {
      userGuid: string | null;
      userIdentifier: string;
      identitySource: string;
      email: string;
      displayName: string;
      roleIds: number[];
    }
  ): Promise<void> => {
    const { data } = await axios.put(`/api/administrative-activity/system-access/${administrativeActivityId}/approve`, {
      ...userData
    });

    return data;
  };

  const denyAccessRequest = async (administrativeActivityId: number): Promise<void> => {
    const { data } = await axios.put(`/api/administrative-activity/system-access/${administrativeActivityId}/reject`);

    return data;
  };

  /**
   * Create a new access request record.
   *
   * @param {IAccessRequestDataObject} administrativeActivityData
   * @return {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const createAdministrativeActivity = async (
    administrativeActivityData: IAccessRequestDataObject
  ): Promise<IGetAccessRequestsListResponse> => {
    const { data } = await axios.post('/api/administrative-activity', administrativeActivityData);

    return data;
  };

  /**
   * Checks if the user has pending access requests or belongs to any projects as a participant
   *
   * @return {*} {Promise<number>}
   */
  const getAdministrativeActivityStanding = async (): Promise<IGetAdministrativeActivityStanding> => {
    const { data } = await axios.get('/api/administrative-activity');

    return data;
  };

  /**
   * Adds a new system user with role.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {string} displayName
   * @param {string} email
   * @param {number} roleId
   * @return {*} {boolean} True if the user is successfully added, false otherwise.
   */
  const addSystemUser = async (
    userIdentifier: string,
    identitySource: string,
    displayName: string,
    email: string,
    roleId: number
  ): Promise<boolean> => {
    const { status } = await axios.post(`/api/user/add`, {
      identitySource,
      userIdentifier,
      displayName,
      email,
      roleId
    });

    return status === 200;
  };

  return {
    sendGCNotification,
    getAdministrativeActivities,
    approveAccessRequest,
    denyAccessRequest,
    createAdministrativeActivity,
    getAdministrativeActivityStanding,
    addSystemUser
  };
};

export default useAdminApi;
