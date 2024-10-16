import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { Telemetry } from '../../repositories/telemetry-repositories/vendors/telemetry.interface';
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

  constructor(connection: IDBConnection) {
    super(connection);

    this.deviceService = new TelemetryDeviceService(connection);
  }

  /**
   * Create a telemetry strategy based on the vendor type.
   *
   * @param {string} vendorType - The telemetry vendor type. ie: device.device_make or 'manual'
   * @return {*} {ITelemetryStrategy} - The telemetry strategy for the vendor.
   */
  createTelemetryStrategy(vendorType: string): ITelemetryStrategy {
    switch (vendorType) {
      case TelemetryVendor.LOTEK:
        return new TelemetryLotekStrategy(this.connection);
      // Add more cases as needed
    }

    throw new ApiGeneralError('Telemetry vendor not supported', ['TelemetryService -> createTelemetryStrategy']);
  }

  async getVendorsFromDeployments(surveyId: number, deploymentIds: number[]): Promise<string[]> {
    const devices = await this.deviceService.getDevices(surveyId, deploymentIds);

    return [...new Set(devices.map((device) => device.device_make))];
  }

  /**
   * Get telemetry for a deployment.
   *
   * Note: Infers the vendor based on the device make.
   *
   * @param {number} surveyId - The survey ID
   * @param {number} deploymentId - The deployment ID
   * @return {*} {Promise<Telemetry[]>} - The telemetry data
   */
  async getTelemetryForDeployment(surveyId: number, deploymentId: number): Promise<Telemetry[]> {
    const device = await this.deviceService.getDevice(surveyId, deploymentId);

    const vendor = this.createTelemetryStrategy(device.device_make);

    return vendor.getTelemetryByDeploymentId(surveyId, deploymentId);
  }

  /**
   * Get telemetry for a list of deployments.
   *
   * Note: Infers the vendors based on the device makes.
   *
   * @param {number} surveyId - The survey ID
   * @param {number[]} deploymentIds - The deployment IDs
   * @return {*} {Promise<Telemetry[]>} - The telemetry data
   */
  async getTelemetryForDeployments(surveyId: number, deploymentIds: number[]) {
    const devices = await this.deviceService.getDevices(surveyId, deploymentIds);

    const deviceMakes = [...new Set(devices.map((device) => device.device_make))];

    const telemetry = await Promise.all(
      deviceMakes.map((deviceMake) => {
        const vendor = this.createTelemetryStrategy(deviceMake);

        return vendor.getTelemetryByDeploymentIds(surveyId, deploymentIds);
      })
    );

    return telemetry.flat();
  }
}
