import { IDBConnection } from '../../../database/db';
import { ApiGeneralError } from '../../../errors/api-error';
import { Telemetry } from '../../../repositories/telemetry-repositories/vendors/telemetry.interface';
import { DBService } from '../../db-service';
import { TelemetryDeviceService } from '../telemetry-device-service';
import { TelemetryLotekStrategy } from './telemetry-lotek-strategy';
import { ITelemetryStrategy, TelemetryVendor } from './telemetry-vendor-context.interface';

/**
 * A context class for working with telemetry vendors (telemetry strategies).
 *
 * @export
 * @class TelemetryLotekContext
 * @extends {DBService}
 */
export class TelemetryVendorContext extends DBService {
  deviceService: TelemetryDeviceService;

  constructor(connection: IDBConnection) {
    super(connection);

    this.deviceService = new TelemetryDeviceService(connection);
  }

  /**
   * Helper method to create a telemetry vendor strategy from a string.
   * Note: Allows strings to convienently pass `device_make` values.
   *
   * @see Enum `TelemetryVendor` ../telemetry.interface.ts
   *
   * @param {TelemetryVendor | string} strategyType - The telemetry vendor strategy type ie: 'lotek' or 'manual'
   * @returns {ITelemetryStrategy}
   */
  createVendorStrategy(strategyType: TelemetryVendor | string): ITelemetryStrategy {
    switch (strategyType) {
      case TelemetryVendor.LOTEK:
        return new TelemetryLotekStrategy(this.connection);
      // TODO: Add additional cases as created
      default:
        throw new ApiGeneralError(`Unknown telemetry strategy: ${strategyType}`);
    }
  }

  /**
   * Get all telemetry vendor strategies.
   *
   * @returns {ITelemetryStrategy[]}
   */
  getAllVendorStrategies(): ITelemetryStrategy[] {
    // TODO: Add additional strategies as needed
    return [new TelemetryLotekStrategy(this.connection)];
  }

  /**
   * Get telemetry vendor strategies for a list of deployments.
   *
   * @async
   * @param {number} surveyId
   * @param {number[]} deploymentIds
   * @returns {Promise<ITelemetryStrategy[]>}
   */
  async getDeploymentsVendorStrategies(surveyId: number, deploymentIds: number[]) {
    // Get all devices associated with deployments
    const devices = await this.deviceService.getDevices(surveyId, deploymentIds);

    return devices.map((device) => this.createVendorStrategy(device.device_make));
  }

  /**
   * Get telemetry data for a single deployment.
   *
   * Note: This will return telemetry for all strategies provided. ie: Lotek + Manual
   *
   * @async
   * @param {ITelemetryStrategy[]} strategies - List of telemetry vendor strategies
   * @param {number} surveyId
   * @param {number} deploymentId
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployment(
    strategies: ITelemetryStrategy[],
    surveyId: number,
    deploymentId: number
  ): Promise<Telemetry[]> {
    const telemetry = await Promise.all(
      strategies.map((strategy) => strategy.getTelemetryByDeploymentId(surveyId, deploymentId))
    );

    return telemetry.flat();
  }

  /**
   * Get telemetry data for a list of deployments.
   *
   * Note: This will return telemetry for all strategies provided. ie: Lotek + Manual
   *
   * @async
   * @param {ITelemetryStrategy[]} strategies - List of telemetry vendor strategies
   * @param {number} surveyId
   * @param {number} deploymentIds
   * @returns {Promise<Telemetry[]>}
   */
  async getTelemetryForDeployments(
    strategies: ITelemetryStrategy[],
    surveyId: number,
    deploymentIds: number[]
  ): Promise<Telemetry[]> {
    const telemetry = await Promise.all(
      strategies.map((strategy) => strategy.getTelemetryByDeploymentIds(surveyId, deploymentIds))
    );

    return telemetry.flat();
  }
}
