import { IDevice } from '../../models/bctw';
import { BctwService } from './bctw-service';
import { GET_COLLAR_VENDORS_ENDPOINT, GET_DEVICE_DETAILS, UPSERT_DEVICE_ENDPOINT } from '../../constants/bctw-routes';

export class BctwDeviceService extends BctwService {
  /**
   * Get a list of all supported collar vendors.
   *
   * @return {*}  {Promise<string[]>}
   * @memberof  BctwDeviceService
   */
  async getCollarVendors(): Promise<string[]> {
    return this._makeGetRequest(GET_COLLAR_VENDORS_ENDPOINT);
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
    return this._makeGetRequest(`${GET_DEVICE_DETAILS}${deviceId}`, { make: deviceMake });
  }

  /**
   * Update device hardware details in BCTW.
   *
   * @param {IDevice} device
   * @returns {*} {IDevice}
   * @memberof BctwService
   */
  async updateDevice(device: IDevice): Promise<IDevice> {
    const { data } = await this.axiosInstance.post(UPSERT_DEVICE_ENDPOINT, device);
    if (data.errors.length) {
      throw Error(JSON.stringify(data.errors));
    }
    return data;
  }
}
