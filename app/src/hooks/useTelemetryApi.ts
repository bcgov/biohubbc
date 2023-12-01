import { CancelTokenSource } from 'axios';
import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';
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

export const useTelemetryApi = () => {
  const config = useContext(ConfigContext);
  const axios = useAxios(config?.API_HOST);
  const devices = useDeviceApi(axios);

  const getVendorTelemetry = async (ids: string[]): Promise<IVendorTelemetry[]> => {
    const { data } = await axios.post<IVendorTelemetry[]>('/api/telemetry/vendor/deployments', ids);
    return data;
  };

  const getManualTelemetry = async (ids: string[]): Promise<IManualTelemetry[]> => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual/deployments', ids);
    return data;
  };

  const createManualTelemetry = async (postData: ICreateManualTelemetry[]): Promise<ICreateManualTelemetry[]> => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual', postData);
    return data;
  };

  const updateManualTelemetry = async (updateData: IUpdateManualTelemetry[]) => {
    const { data } = await axios.patch<IManualTelemetry[]>('/api/telemetry/manual', updateData);
    return data;
  };

  const deleteManualTelemetry = async (ids: string[]) => {
    const { data } = await axios.post<IManualTelemetry[]>('/api/telemetry/manual/delete', ids);
    return data;
  };

  /**
   * Uploads a telemetry CSV for import.
   *
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: ProgressEvent) => void} [onProgress]
   * @return {*}  {Promise<{ submissionId: number }>}
   */
  const uploadCsvForImport = async (
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<{ submissionId: number }> => {
    const formData = new FormData();

    formData.append('media', file);

    const { data } = await axios.post<{ submissionId: number }>(`/api/telemetry/manual/upload`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });

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
      observation_submission_id: submissionId
    });

    return data;
  };

  return {
    devices,
    getManualTelemetry,
    createManualTelemetry,
    updateManualTelemetry,
    getVendorTelemetry,
    deleteManualTelemetry,
    uploadCsvForImport,
    processTelemetryCsvSubmission
  };
};

type TelemetryApiReturnType = ReturnType<typeof useTelemetryApi>;

export type TelemetryApiLookupFunctions = keyof TelemetryApiReturnType['devices']; // Add more options as needed.
