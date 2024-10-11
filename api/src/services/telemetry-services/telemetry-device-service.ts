import { DeviceRecord } from '../../database-models/device';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryDeviceRepository } from '../../repositories/telemetry-repositories/telemetry-device-repository';
import {
  CreateTelemetryDevice,
  DeviceWithMake,
  UpdateTelemetryDevice
} from '../../repositories/telemetry-repositories/telemetry-device-repository.interface';
import { DBService } from '../db-service';

/**
 * A service class for working with telemetry devices.
 *
 * Note: A telemetry `device` is different than a `deployment`.
 * A device may have multiple deployments, but a deployment is associated with a single device.
 *
 * Device: The physical device.
 * Deployment: The time period during which a device is attached to an animal.
 *
 * @export
 * @class TelemetryDeviceService
 * @extends {DBService}
 */
export class TelemetryDeviceService extends DBService {
  telemetryDeviceRepository: TelemetryDeviceRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.telemetryDeviceRepository = new TelemetryDeviceRepository(connection);
  }

  /**
   * Get a single device by its ID.
   *
   * @throws {ApiGeneralError} If the device is not found.
   *
   * @param {number} surveyId
   * @param {number} deviceId
   * @return {*} {Promise<DeviceRecord>}
   */
  async getDevice(surveyId: number, deviceId: number): Promise<DeviceWithMake> {
    const devices = await this.telemetryDeviceRepository.getDevicesByIds(surveyId, [deviceId]);

    if (devices.length !== 1) {
      throw new ApiGeneralError('Device not found', ['TelemetryDeviceService -> getDevice']);
    }

    return devices[0];
  }

  /**
   * Get a list of devices by their IDs.
   *
   * @param {number} surveyId
   * @param {number[]} deviceIds
   * @returns {*} {Promise<DeviceRecord[]>}
   */
  async getDevices(surveyId: number, deviceIds: number[]): Promise<DeviceWithMake[]> {
    return this.telemetryDeviceRepository.getDevicesByIds(surveyId, deviceIds);
  }

  /**
   * Delete a single device by its ID.
   *
   * @throws {ApiGeneralError} If unable to delete the device.
   *
   * @param {number} surveyId
   * @param {number} deviceId
   * @return {*} {Promise<number>} The device ID that was deleted.
   */
  async deleteDevice(surveyId: number, deviceId: number): Promise<number> {
    const devices = await this.telemetryDeviceRepository.deleteDevicesByIds(surveyId, [deviceId]);

    if (devices.length !== 1 || devices[0].device_id !== deviceId) {
      throw new ApiGeneralError('Unable to delete device', ['TelemetryDeviceService -> deleteDevice']);
    }

    return devices[0].device_id;
  }

  /**
   * Create a new device record.
   *
   * @param {CreateTelemetryDevice} device
   * @returns {*} {Promise<DeviceRecord>}
   */
  async createDevice(device: CreateTelemetryDevice): Promise<DeviceRecord> {
    return this.telemetryDeviceRepository.createDevice(device);
  }

  /**
   * Update an existing device record.
   *
   * @param {number} surveyId
   * @param {number} deviceId
   * @param {UpdateTelemetryDevice} device
   * @returns {*} {Promise<DeviceRecord>}
   */
  async updateDevice(surveyId: number, deviceId: number, device: UpdateTelemetryDevice): Promise<DeviceRecord> {
    return this.telemetryDeviceRepository.updateDevice(surveyId, deviceId, device);
  }
}
