import { AxiosInstance } from 'axios';
import { AdministrativeActivityType, AdministrativeActivityStatusType } from 'constants/misc';
import {
  IgcNotifyGenericMessage,
  IgcNotifyRecipient,
  IGetAccessRequestsListResponse
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
   * @param {AdministrativeActivityStatusType[]} [status=[]]
   * @returns {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const getAccessRequests = async (
    status: AdministrativeActivityStatusType[] = []
  ): Promise<IGetAccessRequestsListResponse[]> => {
    const { data } = await axios.get(`/api/administrative-activities`, {
      params: { type: AdministrativeActivityType.SYSTEM_ACCESS, status },
      paramsSerializer: (params) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Update a user access request
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {number} requestId
   * @param {string} requestStatusTypeId
   * @param {number[]} [roleIds=[]]
   * @returns {*} {Promise<void>}
   */
  const updateAccessRequest = async (
    userIdentifier: string,
    identitySource: string,
    requestId: number,
    requestStatusTypeId: number,
    roleIds: number[] = []
  ): Promise<void> => {
    const { data } = await axios.put(`/api/access-request`, {
      userIdentifier,
      identitySource,
      requestId,
      requestStatusTypeId,
      roleIds: roleIds
    });

    return data;
  };

  /**
   * Update an administrative activity
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const updateAdministrativeActivity = async (
    administrativeActivityId: number,
    administrativeActivityStatusTypeId: number
  ): Promise<void> => {
    const { data } = await axios.put(`/api/administrative-activity`, {
      id: administrativeActivityId,
      status: administrativeActivityStatusTypeId
    });

    return data;
  };

  /**
   * Create a new access request record.
   *
   * @param {unknown} administrativeActivityData
   * @return {*} {Promise<IGetAccessRequestsListResponse>}
   */
  const createAdministrativeActivity = async (
    administrativeActivityData: unknown
  ): Promise<IGetAccessRequestsListResponse> => {
    const { data } = await axios.post('/api/administrative-activity', administrativeActivityData);

    return data;
  };

  /**
   * Has pending access requests.
   *
   * @return {*} {Promise<number>}
   */
  const hasPendingAdministrativeActivities = async (): Promise<number> => {
    const { data } = await axios.get('/api/administrative-activity');

    return data;
  };

  /**
   * Grant one or more system roles to a user.
   *
   * @param {number} userId
   * @param {number[]} roleIds
   * @return {*}  {Promise<number>}
   */
  const addSystemUserRoles = async (userId: number, roleIds: number[]): Promise<number> => {
    const { data } = await axios.post(`/api/user/${userId}/system-roles/create`, { roles: roleIds });

    return data;
  };

  /**
   * Adds a new system user with role.
   *
   * Note: Will fail if the system user already exists.
   *
   * @param {string} userIdentifier
   * @param {string} identitySource
   * @param {number} roleId
   * @return {*}
   */
  const addSystemUser = async (userIdentifier: string, identitySource: string, roleId: number): Promise<boolean> => {
    const { status } = await axios.post(`/api/user/add`, {
      identitySource: identitySource,
      userIdentifier: userIdentifier,
      roleId: roleId
    });

    return status === 200;
  };

  return {
    sendGCNotification,
    getAccessRequests,
    updateAccessRequest,
    updateAdministrativeActivity,
    createAdministrativeActivity,
    hasPendingAdministrativeActivities,
    addSystemUserRoles,
    addSystemUser
  };
};

export default useAdminApi;
