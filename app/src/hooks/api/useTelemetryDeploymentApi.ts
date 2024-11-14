import { AxiosInstance } from 'axios';
import {
  CreateTelemetryDeployment,
  TelemetryDeployment,
  UpdateTelemetryDeployment
} from 'interfaces/useTelemetryDeploymentApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions, ApiPaginationResponseParams } from 'types/misc';

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
      `/api/project/${projectId}/survey/${surveyId}/critters/${critterId}/deployments2`,
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
      `/api/project/${projectId}/survey/${surveyId}/deployments2/${deploymentId}`,
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
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments2/${deploymentId}`);

    return data;
  };

  /**
   * Get all telemetry deployments associated with the given survey ID.
   *
   * @param {number} projectId
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<{ deployments: TelemetryDeployment[]; count: number; pagination: ApiPaginationResponseParams }>}
   */
  const getDeploymentsInSurvey = async (
    projectId: number,
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<{ deployments: TelemetryDeployment[]; count: number; pagination: ApiPaginationResponseParams }> => {
    const { data } = await axios.get(`/api/project/${projectId}/survey/${surveyId}/deployments2`, {
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
    const { data } = await axios.delete(`/api/project/${projectId}/survey/${surveyId}/deployments2/${deploymentId}`);

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
    const { data } = await axios.post(`/api/project/${projectId}/survey/${surveyId}/deployments2/delete`, {
      deployment_ids: deploymentIds
    });

    return data;
  };

  return {
    createDeployment,
    updateDeployment,
    getDeploymentById,
    getDeploymentsInSurvey,
    deleteDeployment,
    deleteDeployments
  };
};
