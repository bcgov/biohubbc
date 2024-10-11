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
   * Get telemetry for a deployment of a specific vendor. ie: `Lotek` or `Manual`
   *
   * Note: Vendors will also return manual telemetry data.
   *
   * @param {ITelemetryStrategy} vendor - The telemetry vendor strategy
   * @param {number} surveyId - The survey ID
   * @param {number} deploymentId - The deployment ID
   * @return {*} {Promise<Telemetry[]>} - The telemetry data
   */
  async getVendorTelemetryForDeployment(
    vendor: ITelemetryStrategy,
    surveyId: number,
    deploymentId: number
  ): Promise<Telemetry[]> {
    return vendor.getTelemetryByDeploymentId(surveyId, deploymentId);
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

    const vendor = this.createTelemetryStrategy(device.device_make as TelemetryVendor);

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

    // Get unique device makes
    const uniqueDeviceMakes = [...new Set(devices.map((device) => device.device_make))];

    // Get telemetry for each device make (vendor)
    const telemetryPromises = uniqueDeviceMakes.map((deviceMake) => {
      const vendor = this.createTelemetryStrategy(deviceMake as TelemetryVendor);
      return vendor.getTelemetryByDeploymentIds(surveyId, deploymentIds);
    });

    const telemetry = await Promise.all(telemetryPromises);

    return telemetry.flat();
  }

  //TODO: Implement the following methods once deployment service is complete.
  //
  // async getTelemetryForDeployments(surveyId: number, deploymentIds: number[]) {}
  // async getTelemetryByCritterId(surveyId: number, critterId: number) {}
  // async getTelemetryBySurvey(surveyId: number) {}
  // async findTelemetry() {}
}
