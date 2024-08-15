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
    const { data } = await this.axiosInstance.post('/deploy-device', device);

    return data;
  }

  /**
   * Get all existing deployments.
   *
   * @param {string[]} deploymentIds
   * @return {*}  {Promise<IBctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByIds(deploymentIds: string[]): Promise<IBctwDeploymentRecord[]> {
    const { data } = await this.axiosInstance.get('/get-deployments', {
      params: {
        deployment_ids: deploymentIds
      }
    });

    return data;
  }

  /**
   * Get all existing deployments for a list of critter IDs.
   *
   * @param {string[]} critter_ids
   * @return {*}  {Promise<IBctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByCritterId(critter_ids: string[]): Promise<IBctwDeploymentRecord[]> {
    const { data } = await this.axiosInstance.get('/get-deployments-by-critter-id', {
      params: { critter_ids: critter_ids }
    });

    return data;
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {IDeploymentUpdate} deployment
   * @return {*}  {Promise<IBctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async updateDeployment(deployment: IDeploymentUpdate): Promise<IBctwDeploymentRecord> {
    const { data } = await this.axiosInstance.patch('/update-deployment', deployment);

    return data;
  }

  /**
   * Soft deletes the deployment in BCTW.
   *
   * @param {string} deployment_id uuid
   * @returns {*} {Promise<IBctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async deleteDeployment(deployment_id: string): Promise<IBctwDeploymentRecord> {
    const { data } = await this.axiosInstance.delete(`/delete-deployment/${deployment_id}`);

    return data;
  }
}
