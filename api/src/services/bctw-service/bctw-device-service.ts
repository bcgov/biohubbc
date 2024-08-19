import { BctwDeployDevice } from './bctw-deployment-service';
import { BctwService } from './bctw-service';

export type BctwDevice = Omit<BctwDeployDevice, 'attachment_start' | 'attachment_end' | 'critter_id'> & {
  collar_id: string;
};

export class BctwDeviceService extends BctwService {
  /**
   * Get a list of all supported collar vendors.
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

    if (data.errors.length) {
      throw Error(JSON.stringify(data.errors));
    }

    return data;
  }
}
