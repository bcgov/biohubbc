import { AxiosInstance } from 'axios';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import {
  IAccessRequestDataObject,
  IgcNotifyGenericMessage,
  IgcNotifyRecipient,
  IGetAccessRequestsListResponse,
  ITemplateData
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
    userIdentifier: string,
    identitySource: string,
    roleIds: number[] = []
  ): Promise<void> => {
    const { data } = await axios.put(`/api/administrative-activity/system-access/${administrativeActivityId}/approve`, {
      userIdentifier,
      identitySource,
      roleIds: roleIds
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

  const getTemplates = async (): Promise<ITemplateData[]> => {
    const { data } = await axios.get('/api/template/list');

    return data.templates;
  };

  return {
    sendGCNotification,
    getAdministrativeActivities,
    approveAccessRequest,
    denyAccessRequest,
    createAdministrativeActivity,
    hasPendingAdministrativeActivities,
    addSystemUserRoles,
    addSystemUser,
    getTemplates
  };
};

export default useAdminApi;
