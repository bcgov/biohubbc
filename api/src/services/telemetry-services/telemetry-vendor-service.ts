import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { DBService } from '../db-service';
import { TelemetryDeviceService } from './telemetry-device-service';
import { ITelemetryStrategy, TelemetryVendor } from './telemetry.interface';
import { TelemetryLotekStrategy } from './vendors/telemetry-lotek-strategy';

/**
 * A service class for working with telemetry vendors.
 *
 * Currently supports:
 *    - Lotek (telemetry_lotek) - Automatic data fetching
 *    - Vectronic (telemetry_vectronic) - Automatic data fetching
 *    - ATS (telemetry_ats) - Deprecated automatic data fetching
 *    - Manual (telemetry_manual) - Manually added telemetry data by users (supplemental vendor data)
 *
 * @export
 * @class TelemetryVendorService
 * @extends {DBService}
 */
export class TelemetryVendorService extends DBService {
  deviceService: TelemetryDeviceService;
  // TODO: Uncomment this line once deployment service is complete.
  //
  //deploymentService: DeploymentService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.deviceService = new TelemetryDeviceService(connection);
    // TODO: Uncomment this line once deployment service is complete.
    //
    //this.deploymentService = new DeploymentService(connection);
  }

  /**
   * Create a telemetry strategy based on the vendor type.
   *
   * @param {TelemetryVendor} vendorType - The telemetry vendor type. ie: device.device_make or 'manual'
   * @return {*} {ITelemetryStrategy} - The telemetry strategy for the vendor.
   */
  createTelemetryStrategy(vendorType: TelemetryVendor): ITelemetryStrategy {
    switch (vendorType) {
      case TelemetryVendor.LOTEK:
        return new TelemetryLotekStrategy(this.connection);
      // Add more cases as needed
    }

    throw new ApiGeneralError('Telemetry vendor not supported', ['TelemetryService -> createTelemetryVendor']);
  }

  /**
   * Parse the device key to get the device make and serial.
   *
   * @param {string} deviceKey - The device key ie: `lotek:12345`
   * @return {*} {deviceMake: string, deviceSerial: string} - The device make and serial
   */
  _parseDeviceKey(deviceKey: string) {
    const [deviceMake, deviceSerial] = deviceKey.split(':')[0];

    return { deviceMake, deviceSerial };
  }

  /**
   * Get vendor telemetry for a deployment.
   * Allows control of which vendor to use. ie: lotek, manual, etc.
   *
   * Note: Vendors will also return manual telemetry data.
   *
   * @param {ITelemetryStrategy} vendor - The telemetry vendor strategy
   * @param {number} surveyId - The survey ID
   * @param {number} deploymentId - The deployment ID
   * @return {*} {Promise<ITelemetry[]>} - The telemetry data
   */
  async getVendorTelemetryForDeployment(vendor: ITelemetryStrategy, surveyId: number, deploymentId: number) {
    return vendor.getTelemetryByDeploymentId(surveyId, deploymentId);
  }

  /**
   * Get telemetry for a deployment.
   * Note: Infers the vendor based on the device make.
   *
   * @param {number} surveyId - The survey ID
   * @param {number} deploymentId - The deployment ID
   * @return {*} {Promise<ITelemetry[]>} - The telemetry data
   */
  async getTelemetryForDeployment(surveyId: number, deploymentId: number) {
    const device = await this.deviceService.getDevice(surveyId, deploymentId);

    const { deviceMake } = this._parseDeviceKey(device.device_key);
    const vendor = this.createTelemetryStrategy(deviceMake as TelemetryVendor);

    return vendor.getTelemetryByDeploymentId(surveyId, deploymentId);
  }

  //TODO: Implement the following methods once deployment service is complete.
  //
  // async getTelemetryForDeployments(surveyId: number, deploymentIds: number[]) {}
  // async getTelemetryByCritterId(surveyId: number, critterId: number) {}
  // async getTelemetryBySurvey(surveyId: number) {}
  // async findTelemetry() {}
}
