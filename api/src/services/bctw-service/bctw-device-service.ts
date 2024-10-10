import { BctwDeployDevice } from './bctw-deployment-service';
import { BctwService } from './bctw-service';

export type BctwDevice = Omit<BctwDeployDevice, 'attachment_start' | 'attachment_end' | 'critter_id'> & {
  collar_id: string;
};

export type BctwUpdateCollarRequest = {
  /**
   * The primary ID (uuid) of the collar record to update.
   */
  collar_id: string;
  device_make?: number | null;
  device_model?: string | null;
  frequency?: number | null;
  frequency_unit?: number | null;
};

// TODO: Is this deprecated??
export class BctwDeviceService extends BctwService {
  /**
   * Get a list of all supported collar vendors.
   *
   * TODO: unused?
   *
   * @return {*}  {Promise<string[]>}
   * @memberof  BctwDeviceService
   */
  async getCollarVendors(): Promise<string[]> {
    const { data } = await this.axiosInstance.get('/get-collar-vendors');

    return data;
  }

  /**
   * Get device hardware details by device id and device make.
   *
   * TODO: unused?
   *
   * @param {number} deviceId
   * @param {deviceMake} deviceMake
   * @returns {*} {Promise<BctwDevice[]>}
   * @memberof BctwService
   */
  async getDeviceDetails(deviceId: number, deviceMake: string): Promise<BctwDevice[]> {
    const { data } = await this.axiosInstance.get(`/get-collar-history-by-device/${deviceId}`, {
      params: { make: deviceMake }
    });

    return data;
  }

  /**
   * Update device hardware details in BCTW.
   *
   * @param {BctwDevice} device
   * @returns {*} {BctwDevice}
   * @memberof BctwService
   */
  async updateDevice(device: BctwDevice): Promise<BctwDevice> {
    const { data } = await this.axiosInstance.post('/upsert-collar', device);

    if (data?.errors?.length) {
      throw Error(JSON.stringify(data.errors));
    }

    return data;
  }

  /**
   * Update collar details in BCTW.
   *
   * @param {BctwUpdateCollarRequest} collar - The collar details to update.
   * @return {*}  {Promise<void>}
   * @memberof BctwDeviceService
   */
  async updateCollar(collar: BctwUpdateCollarRequest): Promise<void> {
    const { data } = await this.axiosInstance.patch('/update-collar', collar);

    if (data?.errors?.length) {
      throw Error(JSON.stringify(data.errors));
    }

    return data;
  }
}
