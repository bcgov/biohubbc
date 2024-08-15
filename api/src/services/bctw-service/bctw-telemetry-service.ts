import { z } from 'zod';
import { BctwService } from './bctw-service';

export const IDeployDevice = z.object({
  device_id: z.number(),
  frequency: z.number().optional(),
  frequency_unit: z.string().optional(),
  device_make: z.string().optional(),
  device_model: z.string().optional(),
  attachment_start: z.string(),
  attachment_end: z.string().nullable(),
  critter_id: z.string()
});

export type IDeployDevice = z.infer<typeof IDeployDevice>;

export type IDevice = Omit<IDeployDevice, 'attachment_start' | 'attachment_end' | 'critter_id'> & { collar_id: string };

export const IDeploymentUpdate = z.object({
  deployment_id: z.string(),
  attachment_start: z.string(),
  attachment_end: z.string()
});

export type IDeploymentUpdate = z.infer<typeof IDeploymentUpdate>;

export const IDeploymentRecord = z.object({
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

export type IDeploymentRecord = z.infer<typeof IDeploymentRecord>;

export const IUploadKeyxResponse = z.object({
  errors: z.array(
    z.object({
      row: z.string(),
      error: z.string(),
      rownum: z.number()
    })
  ),
  results: z.array(
    z.object({
      idcollar: z.number(),
      comtype: z.string(),
      idcom: z.string(),
      collarkey: z.string(),
      collartype: z.number(),
      dtlast_fetch: z.string().nullable()
    })
  )
});

export type IUploadKeyxResponse = z.infer<typeof IUploadKeyxResponse>;

export const IKeyXDetails = z.object({
  device_id: z.number(),
  keyx: z
    .object({
      idcom: z.string(),
      comtype: z.string(),
      idcollar: z.number(),
      collarkey: z.string(),
      collartype: z.number()
    })
    .nullable()
});

export type IKeyXDetails = z.infer<typeof IKeyXDetails>;

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

export const IBctwUser = z.object({
  keycloak_guid: z.string(),
  username: z.string()
});

export type IBctwUser = z.infer<typeof IBctwUser>;

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
