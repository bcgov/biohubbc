import { AxiosInstance, AxiosProgressEvent, CancelTokenSource } from 'axios';
import {
  CreateTelemetryDeployment,
  GetSurveyDeploymentsResponse,
  TelemetryDeployment,
  UpdateTelemetryDeployment
} from 'interfaces/useTelemetryDeploymentApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with telemetry deployments.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
export const useTelemetryDeploymentApi = (axios: AxiosInstance) => {
  /**
   * Create a new telemetry deployment.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} critterId
   * @param {CreateTelemetryDeployment} deployment
   * @return {*}  {Promise<void>}
   */
  const createDeployment = async (
    projectId: number,
    surveyId: number,
    critterId: number,
    deployment: CreateTelemetryDeployment
  ): Promise<void> => {
    const { data } = await axios.post(
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments`,
      deployment
    );

    return data;
  };

  /**
   * Update a telemetry deployment.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deploymentId
   * @param {UpdateTelemetryDeployment} deployment
   * @return {*}  {Promise<void>}
   */
  const updateDeployment = async (
    projectId: number,
    surveyId: number,
    deploymentId: number,
    deployment: UpdateTelemetryDeployment
  ): Promise<void> => {
    const { data } = await axios.put(
      `/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`,
      deployment
    );

    return data;
  };

  /**
   * Get a telemetry deployment by Id.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<{ deployment: TelemetryDeployment }>}
   */
  const getDeploymentById = async (
    projectId: number,
    surveyId: number,
    deploymentId: number
  ): Promise<{ deployment: TelemetryDeployment }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`);

    return data;
  };

  /**
   * Get all telemetry deployments associated with the given survey ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<GetSurveyDeploymentsResponse>}
   */
  const getDeploymentsInSurvey = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<GetSurveyDeploymentsResponse> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments`, {
      params: {
        ...pagination
      },
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Delete a telemetry deployment.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<void>}
   */
  const deleteDeployment = async (projectId: number, surveyId: number, deploymentId: number): Promise<void> => {
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/deployments/${deploymentId}`);

    return data;
  };

  /**
   * Delete one ore more telemetry deployments.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @return {*}  {Promise<string>}
   */
  const deleteDeployments = async (projectId: number, surveyId: number, deploymentIds: number[]): Promise<string> => {
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/deployments/delete`, {
      deployment_ids: deploymentIds
    });

    return data;
  };

  /**
   * Imports a deployment CSV.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {File} file
   * @param {CancelTokenSource} [cancelTokenSource]
   * @param {(progressEvent: AxiosProgressEvent) => void} [onProgress]
   * @return {*} {Promise<void>}
   */
  const importManualDeploymentCSV = async (
    projectId: number,
    surveyId: number,
    file: File,
    cancelTokenSource?: CancelTokenSource,
    onProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<void> => {
    const formData = new FormData();

    formData.append('media', file);

    await axios.post(`/api/project/${projectId}/survey/${surveyId}/deployments/import`, formData, {
      cancelToken: cancelTokenSource?.token,
      onUploadProgress: onProgress
    });
  };

  return {
    createDeployment,
    updateDeployment,
    getDeploymentById,
    getDeploymentsInSurvey,
    deleteDeployment,
    deleteDeployments,
    importManualDeploymentCSV
  };
};
