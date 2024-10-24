import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import { TelemetryDeviceKeyFile } from 'interfaces/useTelemetryApi.interface';
import {
  CreateTelemetryDevice,
  TelemetryDevice,
  UpdateTelemetryDevice
} from 'interfaces/useTelemetryDeviceApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with telemetry devices.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useTelemetryDeviceApi = (axios: AxiosInstance) => {
  /**
   * Create a new telemetry device.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {CreateTelemetryDevice} device
   * @return {*}  {Promise<void>}
   */
  const createDevice = async (projectId: number, surveyId: number, device: CreateTelemetryDevice): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/devices`, device);

    return data;
  };

  /**
   * Update a telemetry device.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deviceId
   * @param {UpdateTelemetryDevice} device
   * @return {*}  {Promise<number>}
   */
  const updateDevice = async (
    projectId: number,
    surveyId: number,
    deviceId: number,
    device: UpdateTelemetryDevice
  ): Promise<number> => {
    const { data } = await axios.put(`/api/project/${projectId}/survey/${surveyId}/devices/${deviceId}`, device);

    return data;
  };

  /**
   * Get a telemetry device.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deviceId
   * @return {*}  {Promise<{ device: TelemetryDevice }>}
   */
  const getDeviceById = async (
    projectId: number,
    surveyId: number,
    deviceId: number
  ): Promise<{ device: TelemetryDevice }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/devices/${deviceId}`);

    return data;
  };

  /**
   * Get all telemetry devices associated with the given survey ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deviceId
   * @return {*}  {Promise<{ device: TelemetryDevice }>}
   */
  const getDevicesInSurvey = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<{ devices: TelemetryDevice[] }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/devices`, {
      params: {
        ...pagination
      },
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Delete a telemetry device.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deviceId
   * @return {*}  {Promise<void>}
   */
  const deleteDevice = async (projectId: number, surveyId: number, deviceId: number): Promise<void> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/devices/${deviceId}`);

    return data;
  };

  /**
   * Delete one or more telemetry devices.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} deviceIds
   * @return {*}  {Promise<void>}
   */
  const deleteDevices = async (projectId: number, surveyId: number, deviceIds: number[]): Promise<void> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/devices/delete`, {
      device_ids: deviceIds
    });

    return data;
  };

  /**
   * Upload a telemetry device credential file.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<IUploadAttachmentResponse>}
   */
  const uploadTelemetryDeviceCredentialFile = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<IUploadAttachmentResponse> => {
    const req_message = new FormData();

    req_message.append('media', file);

    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/attachments/telemetry`,
      req_message,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );

    return data;
  };

  /**
   * Get all uploaded telemetry device credential key files.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @return {*}  {Promise<TelemetryDeviceKeyFile[]>}
   */
  const getTelemetryDeviceKeyFiles = async (projectId: number, surveyId: number): Promise<TelemetryDeviceKeyFile[]> => {
    const { data } = await axios.get<{ telemetryAttachments: TelemetryDeviceKeyFile[] }>(
      `/api/project/${projectId}/survey/${surveyId}/attachments/telemetry`
    );

    return data.telemetryAttachments;
  };

  return {
    createDevice,
    updateDevice,
    getDeviceById,
    getDevicesInSurvey,
    deleteDevice,
    deleteDevices,
    uploadTelemetryDeviceCredentialFile,
    getTelemetryDeviceKeyFiles
  };
};
