import {
  DELETE_DEPLOYMENT_ENDPOINT,
  DEPLOY_DEVICE_ENDPOINT,
  GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT,
  GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT,
  GET_DEPLOYMENTS_ENDPOINT,
  UPDATE_DEPLOYMENT_ENDPOINT
} from '../../constants/bctw-routes';
import { IBctwDeploymentRecord, IDeployDevice, IDeploymentUpdate } from '../../models/bctw';
import { BctwService } from './bctw-service';

export class BctwDeploymentService extends BctwService {
  /**
   * Create a new deployment for a telemetry device on a critter.
   *
   * @param {IDeployDevice} device
   * @return {*}  {Promise<IBctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async createDeployment(device: IDeployDevice): Promise<IBctwDeploymentRecord> {
    return this.axiosInstance.post(DEPLOY_DEVICE_ENDPOINT, device);
  }

  /**
   * Get deployments by device id and device make, may return results for multiple critters.
   *
   * @param {number} deviceId
   * @param {string} deviceMake
   * @returns {*} {Promise<IBctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByDeviceId(deviceId: number, deviceMake: string): Promise<IBctwDeploymentRecord[]> {
    return this._makeGetRequest(GET_DEPLOYMENTS_BY_DEVICE_ENDPOINT, {
      device_id: String(deviceId),
      make: deviceMake
    });
  }

  /**
   * Get all existing deployments.
   *
   * @param {string[]} deploymentIds
   * @return {*}  {Promise<IBctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByIds(deploymentIds: string[]): Promise<IBctwDeploymentRecord[]> {
    const queryParams: Record<string, string | string[]> = {};
    if (deploymentIds.length > 0) {
      queryParams.deployment_ids = deploymentIds;
    }
    return this._makeGetRequest(GET_DEPLOYMENTS_ENDPOINT, queryParams);
  }

  /**
   * Get all existing deployments for a list of critter IDs.
   *
   * @param {string[]} critter_ids
   * @return {*}  {Promise<IBctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByCritterId(critter_ids: string[]): Promise<IBctwDeploymentRecord[]> {
    const query = { critter_ids: critter_ids };
    return this._makeGetRequest(GET_DEPLOYMENTS_BY_CRITTER_ENDPOINT, query);
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {IDeploymentUpdate} deployment
   * @return {*}  {Promise<IBctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async updateDeployment(deployment: IDeploymentUpdate): Promise<IBctwDeploymentRecord> {
    return this.axiosInstance.patch(UPDATE_DEPLOYMENT_ENDPOINT, deployment);
  }

  /**
   * Soft deletes the deployment in BCTW.
   *
   * @param {string} deployment_id uuid
   * @returns {*} {Promise<IBctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async deleteDeployment(deployment_id: string): Promise<IBctwDeploymentRecord> {
    return this.axiosInstance.delete(`${DELETE_DEPLOYMENT_ENDPOINT}/${deployment_id}`);
  }
}
