import { z } from 'zod';
import { BctwService } from './bctw-service';

export const IAllTelemetry = z
  .object({
    id: z.string().uuid(),
    deployment_id: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number(),
    acquisition_date: z.string(),
    telemetry_type: z.string()
  })
  .and(
    // One of telemetry_id or telemetry_manual_id is expected to be non-null
    z.union([
      z.object({
        telemetry_id: z.string().uuid(),
        telemetry_manual_id: z.null()
      }),
      z.object({
        telemetry_id: z.null(),
        telemetry_manual_id: z.string().uuid()
      })
    ])
  );
export type IAllTelemetry = z.infer<typeof IAllTelemetry>;

export const IVendorTelemetry = z.object({
  telemetry_id: z.string(),
  deployment_id: z.string().uuid(),
  collar_transaction_id: z.string().uuid(),
  critter_id: z.string().uuid(),
  deviceid: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number(),
  vendor: z.string(),
  acquisition_date: z.string()
});
export type IVendorTelemetry = z.infer<typeof IVendorTelemetry>;

export const IManualTelemetry = z.object({
  telemetry_manual_id: z.string().uuid(),
  deployment_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  acquisition_date: z.string()
});
export type IManualTelemetry = z.infer<typeof IManualTelemetry>;

export interface ICreateManualTelemetry {
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
}

export class BctwTelemetryService extends BctwService {
  /**
   * Get all manual telemetry records
   * This set of telemetry is mostly useful for testing purposes.
   *
   * @returns {*} IManualTelemetry[]
   **/
  async getManualTelemetry(): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.get('/manual-telemetry');
    return res.data;
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployments
   * @returns {*} IManualTelemetry[]
   */
  async getManualTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post('/manual-telemetry/deployments', deployment_ids);
    return res.data;
  }

  /**
   * retrieves manual telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deployment_ids - bctw deployments
   * @returns {*} IVendorTelemetry[]
   */
  async getVendorTelemetryByDeploymentIds(deployment_ids: string[]): Promise<IVendorTelemetry[]> {
    const res = await this.axiosInstance.post('/vendor-telemetry/deployments', deployment_ids);
    return res.data;
  }

  /**
   * retrieves manual and vendor telemetry from list of deployment ids
   *
   * @async
   * @param {string[]} deploymentIds - bctw deployments
   * @returns {*} IAllTelemetry[]
   */
  async getAllTelemetryByDeploymentIds(deploymentIds: string[]): Promise<IAllTelemetry[]> {
    const res = await this.axiosInstance.post('/all-telemetry/deployments', deploymentIds);
    return res.data;
  }

  /**
   * Delete manual telemetry records by telemetry_manual_id
   * Note: This is a post request that accepts an array of ids
   * @param {string[]} telemetry_manual_ids
   *
   * @returns {*} IManualTelemetry[]
   **/
  async deleteManualTelemetry(telemetry_manual_ids: string[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post('/manual-telemetry/delete', telemetry_manual_ids);
    return res.data;
  }

  /**
   * Bulk create manual telemetry records
   * @param {ICreateManualTelemetry[]} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async createManualTelemetry(payload: ICreateManualTelemetry[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.post('/manual-telemetry', payload);
    return res.data;
  }

  /**
   * Bulk update manual telemetry records
   * @param {IManualTelemetry} payload
   *
   * @returns {*} IManualTelemetry[]
   **/
  async updateManualTelemetry(payload: IManualTelemetry[]): Promise<IManualTelemetry[]> {
    const res = await this.axiosInstance.patch('/manual-telemetry', payload);
    return res.data;
  }
}
