import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IAllTelemetryAdvancedFilters } from 'features/summary/tabular-data/telemetry/TelemetryListFilterForm';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import {
  IAllTelemetry,
  ICodeResponse,
  ICreateManualTelemetry,
  IFindTelemetryResponse,
  IManualTelemetry,
  IUpdateManualTelemetry,
  TelemetryDeviceKeyFile
} from 'interfaces/useTelemetryApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with telemetry.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useTelemetryApi = (axios: AxiosInstance) => {
  /**
   * Get telemetry for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IAllTelemetryAdvancedFilters} filterFieldData
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const findTelemetry = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IAllTelemetryAdvancedFilters
  ): Promise<IFindTelemetryResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/telemetry', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  /**
   * Get list of manual and vendor telemetry by deployment ids
   *
   * @param {string[]} deploymentIds BCTW deployment ids
   * @return {*}  {Promise<IAllTelemetry[]>}
   */
  const getAllTelemetryByDeploymentIds = async (deploymentIds: string[]): Promise<IAllTelemetry[]> => {
    const { data } = await axios.get<IAllTelemetry[]>('/api/telemetry/deployments', {
      params: {
        bctwDeploymentIds: deploymentIds
      }
    });
    return data;
  };

  /**
   * Get all telemetry for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<IAllTelemetry[]>}
   */
  const getTelemetryForSurvey = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<IAllTelemetry[]> => {
    const { data } = await axios.get<IAllTelemetry[]>(`/api/project/${projectId}/survey/${surveyId}/telemetry`, {
      params: {
        ...pagination
      },
      paramsSerializer: (params) => qs.stringify(params)
    });

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
    const { data } = await axios.post('/api/telemetry/manual/process', {
      submission_id: submissionId
    });

    return data;
  };

  /**
   * Returns a list of code values for a given code header.
   *
   * @param {string} codeHeader
   * @return {*}  {Promise<ICodeResponse[]>}
   */
  const getCodeValues = async (codeHeader: string): Promise<ICodeResponse[]> => {
    try {
      const { data } = await axios.get(`/api/telemetry/code?codeHeader=${codeHeader}`);
      return data;
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
    return [];
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
    findTelemetry,
    getAllTelemetryByDeploymentIds,
    getTelemetryForSurvey,
    createManualTelemetry,
    updateManualTelemetry,
    deleteManualTelemetry,
    uploadCsvForImport,
    processTelemetryCsvSubmission,
    getCodeValues,
    uploadTelemetryDeviceCredentialFile,
    getTelemetryDeviceKeyFiles
  };
};

export default useTelemetryApi;
