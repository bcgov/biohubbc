import { CancelTokenSource } from 'axios';
import { useConfigContext } from 'hooks/useContext';
import useAxios from './api/useAxios';
import { useDeviceApi } from './telemetry/useDeviceApi';

export interface ICritterDeploymentResponse {
  critter_id: string;
  device_id: number;
  deployment_id: string;
  survey_critter_id: string;
  alias: string;
  attachment_start: string;
  attachment_end?: string;
  taxon: string;
}

export interface IUpdateManualTelemetry {
  telemetry_manual_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}
export interface ICreateManualTelemetry {
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}

export interface IManualTelemetry extends ICreateManualTelemetry {
  telemetry_manual_id: string;
}

export interface IVendorTelemetry extends ICreateManualTelemetry {
  telemetry_id: string;
}

export interface ITelemetry {
  id: string;
  deployment_id: string;
  telemetry_manual_id: string;
  telemetry_id: number | null;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  telemetry_type: string;
}

export const useTelemetryApi = () => {
  const config = useConfigContext();
  const axios = useAxios(config.API_HOST);
  const devices = useDeviceApi(axios);

  /**
   * Get list of manual and vendor telemetry by deployment ids
   *
   * @param {string[]} deploymentIds BCTW deployment ids
   * @return {*}  {Promise<ITelemetry[]>}
   */
  const getAllTelemetryByDeploymentIds = async (deploymentIds: string[]): Promise<ITelemetry[]> => {
    const { data } = await axios.post<ITelemetry[]>('/api/telemetry/deployments', deploymentIds);
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
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ submission_id: number }>}
   */
  const uploadCsvForImport = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
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

type TelemetryApiReturnType = ReturnType<typeof useTelemetryApi>;

export type TelemetryApiLookupFunctions = keyof TelemetryApiReturnType['devices']; // Add more options as needed.
