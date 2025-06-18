import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import { IAllTelemetryAdvancedFilters } from 'features/summary/tabular-data/telemetry/TelemetryListFilterForm';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import {
  GetSurveyTelemetryResponse,
  IAllTelemetry,
  ICreateManualTelemetry,
  IFindTelemetryResponse,
  IUpdateManualTelemetry,
  TelemetryDeviceKeyFile,
  TelemetryFilters,
  TelemetrySpatial
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
   * Get a telemetry record by id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} telemetryId The telemetry record ID (uuid)
   * @return {*}  {Promise<{ telemetry: IAllTelemetry }>}
   */
  const getTelemetryById = async (
    projectId: number,
    surveyId: number,
    telemetryId: string
  ): Promise<{ telemetry: IAllTelemetry }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/telemetry/${telemetryId}`);

    return data;
  };

  /**
   * Get all telemetry for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {TelemetryFilters} filters
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<GetSurveyTelemetryResponse>}
   */
  const getTelemetryForSurvey = async (
    projectId: number,
    surveyId: number,
    filters?: TelemetryFilters,
    pagination?: ApiPaginationRequestOptions
  ): Promise<GetSurveyTelemetryResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/telemetry`, {
      params: {
        ...filters,
        ...pagination
      },
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Get all telemetry spatial data for a survey.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {TelemetryFilters} filters
   * @return {*}  {Promise<{ telemetry: TelemetrySpatial[]; supplementaryData: { count: number } }>}
   */
  const getTelemetrySpatialForSurvey = async (
    projectId: number,
    surveyId: number,
    filters?: TelemetryFilters
  ): Promise<{
    telemetry: TelemetrySpatial[];
    supplementaryData: { count: number; start_date: string; end_date: string };
  }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/telemetry/spatial`, {
      params: filters
    });

    return data;
  };

  /**
   * Bulk create Manual Telemetry records.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ICreateManualTelemetry[]} manualTelemetry Manual Telemetry create objects
   * @return {*}  {Promise<void>}
   */
  const createManualTelemetry = async (
    projectId: number,
    surveyId: number,
    manualTelemetry: ICreateManualTelemetry[]
  ): Promise<void> => {
    await axios.post<void>(`/api/project/${projectId}/survey/${surveyId}/deployments/telemetry/manual`, {
      telemetry: manualTelemetry
    });
  };

  /**
   * Bulk update Manual Telemetry records.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {IUpdateManualTelemetry[]} manualTelemetry Manual Telemetry update objects
   * @return {*}  {Promise<void>}
   */
  const updateManualTelemetry = async (
    projectId: number,
    surveyId: number,
    manualTelemetry: IUpdateManualTelemetry[]
  ): Promise<void> => {
    await axios.put<void>(`/api/project/${projectId}/survey/${surveyId}/deployments/telemetry/manual`, {
      telemetry: manualTelemetry
    });

    return;
  };

  /**
   * Bulk delete manual telemetry records.
   *
   * @param {number} projectId
   * @param {number} surveyId
   *
   * @param {string[]} telemetryIds Manual Telemetry ids to delete
   * @return {*}  {Promise<void>}
   */
  const deleteManualTelemetry = async (projectId: number, surveyId: number, telemetryIds: string[]): Promise<void> => {
    await axios.post<void>(`/api/project/${projectId}/survey/${surveyId}/deployments/telemetry/manual/delete`, {
      telemetry_manual_ids: telemetryIds
    });

    return;
  };

  /**
   * Imports a telemetry CSV.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*} {Promise<void>}
   */
  const importManualTelemetryCSV = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<void> => {
    const formData = new FormData();

    formData.append('media', file);

    await axios.post(`/api/project/${projectId}/survey/${surveyId}/telemetry/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });
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
    getTelemetryById,
    getTelemetryForSurvey,
    getTelemetrySpatialForSurvey,
    createManualTelemetry,
    updateManualTelemetry,
    deleteManualTelemetry,
    importManualTelemetryCSV,
    uploadTelemetryDeviceCredentialFile,
    getTelemetryDeviceKeyFiles
  };
};

export default useTelemetryApi;
