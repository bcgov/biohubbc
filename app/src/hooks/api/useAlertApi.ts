import { AxiosInstance } from 'axios';
import {
  IAlert,
  IAlertCreateObject,
  IAlertFilterParams,
  IAlertUpdateObject,
  IGetAlertsResponse
} from 'interfaces/useAlertApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for managing alerts
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useAlertApi = (axios: AxiosInstance) => {
  /**
   * Get system alert details based on its ID for viewing purposes.
   *
   * @param {IAlertFilterParams} filterObject
   * @param {ApiPaginationRequestOptions} pagination
   * @return {*} {Promise<IGetAlertsResponse[]>}
   */
  const getAlerts = async (
    filterObject?: IAlertFilterParams,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IGetAlertsResponse> => {
    const params = {
      ...pagination,
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
   * Create a new system alert
   *
   * @param {IAlertCreateObject} alert
   * @return {*} {Promise<void>}
   */
  const createAlert = async (alert: IAlertCreateObject): Promise<void> => {
    const { data } = await axios.post(`/api/alert`, alert);

    return data;
  };

  /**
   * Create a new system alert
   *
   * @param {IAlert} alert
   * @return {*} {Promise<{ alert_id: number }>}
   */
  const updateAlert = async (alert: IAlertUpdateObject): Promise<{ alert_id: number }> => {
    const { data } = await axios.put(`/api/alert/${alert.alert_id}`, alert);

    return data;
  };

  /**
   * Get system alert details based on its ID for viewing purposes.
   *
   * @param {number} alertId
   * @return {*} {Promise<{ alert_id: number }>}
   */
  const deleteAlert = async (alertId: number): Promise<{ alert_id: number }> => {
    const { data } = await axios.delete(`/api/alert/${alertId}`);

    return data;
  };

  return { getAlerts, updateAlert, createAlert, deleteAlert, getAlertById };
};
