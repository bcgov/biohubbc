import { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { ConfigContext } from 'contexts/configContext';
import {
  ICreateManualTelemetry,
  IManualTelemetry,
  ITelemetry,
  IUpdateManualTelemetry,
  IVendorTelemetry
} from 'interfaces/useTelemetryApi.interface';
import { useContext } from 'react';
import useAxios from './api/useAxios';
import { useDeviceApi } from './telemetry/useDeviceApi';

export const useTelemetryApi = () => {
  const config = useContext(ConfigContext);
  const axios = useAxios(config?.API_HOST);
  const devices = useDeviceApi(axios);

  /**
   * Get list of manual and vendor telemetry by deployment ids
   *
   * @param {string[]} deploymentIds BCTW deployment ids
   * @return {*}  {Promise<ITelemetry[]>}
   */
  const getAllTelemetryByDeploymentIds = async (deploymentIds: string[]): Promise<ITelemetry[]> => {
    const { data } = await axios.get<ITelemetry[]>(
      `/api/telemetry/deployments?bctwDeploymentIds=${deploymentIds.join(',')}`
    );
    return data;
  };

  /**
   * Get a list of vendor retrieved telemetry by deployment ids
   *
   * @param {string[]} deploymentIds Vendor telemetry deployment ids
   * @return {*}  {Promise<IVendorTelemetry[]>}
   */
  const getVendorTelemetryByDeploymentIds = async (deploymentIds: string[]): Promise<IVendorTelemetry[]> => {
    const { data } = await axios.post<IVendorTelemetry[]>('/api/telemetry/vendor/deployments', deploymentIds);
    return data;
  };

  /**
   * Get a list of manually created telemetry by deployment ids
   *
   * @param {string[]} deploymentIds Manual Telemetry deployment ids
   * @return {*}  {Promise<IManualTelemetry[]>}
   */
  const getManualTelemetryByDeploymentIds = async (deploymentIds: string[]): Promise<IManualTelemetry[]> => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual/deployments', deploymentIds);
    return data;
  };

  /**
   * Bulk create Manual Telemetry
   *
   * @param {ICreateManualTelemetry[]} manualTelemetry Manual Telemetry create objects
   * @return {*}  {Promise<ICreateManualTelemetry[]>}
   */
  const createManualTelemetry = async (
    manualTelemetry: ICreateManualTelemetry[]
  ): Promise<ICreateManualTelemetry[]> => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual', manualTelemetry);
    return data;
  };

  /**
   * Bulk update Manual Telemetry
   *
   * @param {IUpdateManualTelemetry[]} manualTelemetry Manual Telemetry update objects
   * @return {*}
   */
  const updateManualTelemetry = async (manualTelemetry: IUpdateManualTelemetry[]) => {
    const { data } = await axios.patch<IManualTelemetry[]>('/api/telemetry/manual', manualTelemetry);
    return data;
  };

  /**
   * Delete manual telemetry records
   *
   * @param {string[]} telemetryIds Manual Telemetry ids to delete
   * @return {*}
   */
  const deleteManualTelemetry = async (telemetryIds: string[]) => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual/delete', telemetryIds);
    return data;
  };

  /**
   * Uploads a telemetry CSV for import.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ submission_id: number }>}
   */
  const uploadCsvForImport = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<{ submission_id: number }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post<{ submission_id: number }>(
      `/api/project/${projectId}/survey/${surveyId}/telemetry/upload`,
      formData,
      {
        cancelToken: cancelTokenSource?.token,
        onUploadProgress: onProgress
      }
    );
    return data;
  };

  /**
   * Begins processing an uploaded telemetry CSV for import
   *
   * @param {number} submissionId
   * @return {*}
   */
  const processTelemetryCsvSubmission = async (submissionId: number) => {
    const { data } = await axios.post(`/api/telemetry/manual/process`, {
      submission_id: submissionId
    });

    return data;
  };

  return {
    devices,
    getAllTelemetryByDeploymentIds,
    getManualTelemetryByDeploymentIds,
    createManualTelemetry,
    updateManualTelemetry,
    getVendorTelemetryByDeploymentIds,
    deleteManualTelemetry,
    uploadCsvForImport,
    processTelemetryCsvSubmission
  };
};
