import { AxiosInstance } from 'axios';
import { IAlert, IAlertCreateObject, IAlertFilterParams, IAlertUpdateObject, IGetAlertsResponse } from 'interfaces/useAlertApi.interface';
import qs from 'qs';

/**
 * Returns a set of supported api methods for managing alerts
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useAlertApi = (axios: AxiosInstance) => {
  /**
   * Get project alert details based on its ID for viewing purposes.
   *
   * @param {IAlertFilterParams} filterObject
   * @return {*} {Promise<IGetAlertsResponse[]>}
   */
  const getAlerts = async (filterObject?: IAlertFilterParams): Promise<IGetAlertsResponse> => {
    const params = {
      ...filterObject
    };

    const { data } = await axios.get(`/api/alert`, {
      params: params,
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    return data;
  };

  /**
   * Get a specific alert for editing
   *
   * @param {number} alertId
   * @return {*} {Promise<IAlert>}
   */
  const getAlertById = async (alertId: number): Promise<IAlert> => {
    const { data } = await axios.get(`/api/alert/${alertId}`);

    return data;
  };

  /**
   * Create a new project alert
   *
   * @param {IAlertCreateObject} alert
   * @return {*}  {Promise<ICreateAlertResponse>}
   */
  const createAlert = async (alert: IAlertCreateObject): Promise<void> => {
    const { data } = await axios.post(`/api/alert`, alert);

    return data;
  };

  /**
   * Create a new project alert
   *
   * @param {IAlert} alert
   * @return {*}  {Promise<ICreateAlertResponse>}
   */
  const updateAlert = async (alert: IAlertUpdateObject): Promise<void> => {
    const { data } = await axios.patch(`/api/alert/${alert.alert_id}`, alert);

    return data;
  };

  /**
   * Get project alert details based on its ID for viewing purposes.
   *
   * @param {number} alertId
   * @return {*} {Promise<IGetAlertsResponse[]>}
   */
  const deleteAlert = async (alertId: number): Promise<void> => {
    const { data } = await axios.delete(`/api/alert/${alertId}`);

    return data;
  };

  return { getAlerts, updateAlert, createAlert, deleteAlert, getAlertById };
};
