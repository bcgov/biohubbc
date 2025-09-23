import { AxiosInstance } from 'axios';
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
   * @param {number} surveyId
   * @param {number} critterId
   * @param {CreateTelemetryDeployment} deployment
   * @return {*}  {Promise<void>}
   */
  const createDeployment = async (
    surveyId: number,
    critterId: number,
    deployment: CreateTelemetryDeployment
  ): Promise<void> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/critters/${critterId}/deployments`, deployment);

    return data;
  };

  /**
   * Update a telemetry deployment.
   * @param {number} surveyId
   * @param {number} deploymentId
   * @param {UpdateTelemetryDeployment} deployment
   * @return {*}  {Promise<void>}
   */
  const updateDeployment = async (
    surveyId: number,
    deploymentId: number,
    deployment: UpdateTelemetryDeployment
  ): Promise<void> => {
    const { data } = await axios.put(`/api/survey/${surveyId}/deployments/${deploymentId}`, deployment);

    return data;
  };

  /**
   * Get a telemetry deployment by Id.
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<{ deployment: TelemetryDeployment }>}
   */
  const getDeploymentById = async (
    surveyId: number,
    deploymentId: number
  ): Promise<{ deployment: TelemetryDeployment }> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/deployments/${deploymentId}`);

    return data;
  };

  /**
   * Get all telemetry deployments associated with the given survey ID.
   * @param {number} surveyId
   * @param {ApiPaginationRequestOptions} [pagination]
   * @return {*}  {Promise<GetSurveyDeploymentsResponse>}
   */
  const getDeploymentsInSurvey = async (
    surveyId: number,
    pagination?: ApiPaginationRequestOptions
  ): Promise<GetSurveyDeploymentsResponse> => {
    const { data } = await axios.get(`/api/survey/${surveyId}/deployments`, {
      params: {
        ...pagination
      },
      paramsSerializer: (params) => qs.stringify(params)
    });

    return data;
  };

  /**
   * Delete a telemetry deployment.
   * @param {number} surveyId
   * @param {number} deploymentId
   * @return {*}  {Promise<void>}
   */
  const deleteDeployment = async (surveyId: number, deploymentId: number): Promise<void> => {
    const { data } = await axios.delete(`/api/survey/${surveyId}/deployments/${deploymentId}`);

    return data;
  };

  /**
   * Delete one ore more telemetry deployments.
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @return {*}  {Promise<string>}
   */
  const deleteDeployments = async (surveyId: number, deploymentIds: number[]): Promise<string> => {
    const { data } = await axios.post(`/api/survey/${surveyId}/deployments/delete`, {
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
