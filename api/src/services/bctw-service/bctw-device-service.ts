import { IDevice } from '../../models/bctw';
import { BctwService } from './bctw-service';

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
   * @returns {*} {Promise<IDevice[]>}
   * @memberof BctwService
   */
  async getDeviceDetails(deviceId: number, deviceMake: string): Promise<IDevice[]> {
    const { data } = await this.axiosInstance.get(`/get-collar-history-by-device/${deviceId}`, {
      params: { make: deviceMake }
    });

    return data;
  }

  /**
   * Update device hardware details in BCTW.
   *
   * @param {IDevice} device
   * @returns {*} {IDevice}
   * @memberof BctwService
   */
  async updateDevice(device: IDevice): Promise<IDevice> {
    const { data } = await this.axiosInstance.post('/upsert-collar', device);

    if (data.errors.length) {
      throw Error(JSON.stringify(data.errors));
    }

    return data;
  }
}
