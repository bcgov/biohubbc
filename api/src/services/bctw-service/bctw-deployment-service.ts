import { z } from 'zod';
import { BctwService } from './bctw-service';

export const BctwDeploymentRecordWithDeviceMeta = z.object({
  assignment_id: z.string().uuid(),
  collar_id: z.string().uuid(),
  critter_id: z.string().uuid(),
  created_at: z.string(),
  created_by_user_id: z.string().nullable(),
  updated_at: z.string().nullable(),
  updated_by_user_id: z.string().nullable(),
  valid_from: z.string(),
  valid_to: z.string().nullable(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  deployment_id: z.string(),
  device_id: z.number().nullable(),
  device_make: z.number().nullable(),
  device_model: z.string().nullable(),
  frequency: z.number().nullable(),
  frequency_unit: z.number().nullable()
});
export type BctwDeploymentRecordWithDeviceMeta = z.infer<typeof BctwDeploymentRecordWithDeviceMeta>;

export const BctwDeploymentRecord = z.object({
  assignment_id: z.string(),
  collar_id: z.string(),
  critter_id: z.string(),
  created_at: z.string(),
  created_by_user_id: z.string(),
  updated_at: z.string(),
  updated_by_user_id: z.string(),
  valid_from: z.string(),
  valid_to: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string(),
  deployment_id: z.string(),
  device_id: z.number()
});
export type BctwDeploymentRecord = z.infer<typeof BctwDeploymentRecord>;

export const BctwDeploymentUpdate = z.object({
  deployment_id: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable()
});
export type BctwDeploymentUpdate = z.infer<typeof BctwDeploymentUpdate>;

export const BctwDeployDevice = z.object({
  deployment_id: z.string().uuid(),
  device_id: z.number(),
  frequency: z.number().optional(),
  frequency_unit: z.string().optional(),
  device_make: z.string().optional(),
  device_model: z.string().optional(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  critter_id: z.string()
});
export type BctwDeployDevice = z.infer<typeof BctwDeployDevice>;

export class BctwDeploymentService extends BctwService {
  /**
   * Create a new deployment for a telemetry device on a critter.
   *
   * @param {BctwDeployDevice} device
   * @return {*}  {Promise<BctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async createDeployment(device: BctwDeployDevice): Promise<BctwDeploymentRecord> {
    const { data } = await this.axiosInstance.post('/deploy-device', device);

    return data;
  }

  /**
   * Get deployment records for a list of deployment IDs.
   *
   * @param {string[]} deploymentIds
   * @return {*}  {Promise<BctwDeploymentRecordWithDeviceMeta[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByIds(deploymentIds: string[]): Promise<BctwDeploymentRecordWithDeviceMeta[]> {
    const { data } = await this.axiosInstance.post('/get-deployments', deploymentIds);

    return data;
  }

  /**
   * Get all existing deployments for a list of critter IDs.
   *
   * @param {string[]} critter_ids
   * @return {*}  {Promise<BctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async getDeploymentsByCritterId(critter_ids: string[]): Promise<BctwDeploymentRecord[]> {
    const { data } = await this.axiosInstance.get('/get-deployments-by-critter-id', {
      params: { critter_ids: critter_ids }
    });

    return data;
  }

  /**
   * Update the start and end dates of an existing deployment.
   *
   * @param {BctwDeploymentUpdate} deployment
   * @return {*}  {Promise<BctwDeploymentRecord[]>}
   * @memberof BctwDeploymentService
   */
  async updateDeployment(deployment: BctwDeploymentUpdate): Promise<Omit<BctwDeploymentRecord, 'device_id'>[]> {
    const { data } = await this.axiosInstance.patch('/update-deployment', deployment);

    return data;
  }

  /**
   * Soft deletes the deployment in BCTW.
   *
   * @param {string} deployment_id uuid
   * @returns {*} {Promise<BctwDeploymentRecord>}
   * @memberof BctwDeploymentService
   */
  async deleteDeployment(deployment_id: string): Promise<BctwDeploymentRecord> {
    const { data } = await this.axiosInstance.delete(`/delete-deployment/${deployment_id}`);

    return data;
  }
}
