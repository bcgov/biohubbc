import { DeviceRecord } from '../../database-models/device';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryDeviceRepository } from '../../repositories/telemetry-repositories/telemetry-device-repository';
import {
  CreateTelemetryDevice,
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
   * @param {number} device_id
   * @return {*} {Promise<DeviceRecord>}
   */
  async getDevice(device_id: number): Promise<DeviceRecord> {
    const devices = await this.telemetryDeviceRepository.getDevicesByIds([device_id]);

    if (devices.length !== 1) {
      throw new ApiGeneralError('Device not found', ['TelemetryDeviceService -> getDevice']);
    }

    return devices[0];
  }

  /**
   * Get a list of devices by their IDs.
   *
   * @param {number[]} deviceIds
   * @returns {*} {Promise<DeviceRecord[]>}
   *
   */
  async getDevices(deviceIds: number[]): Promise<DeviceRecord[]> {
    return this.telemetryDeviceRepository.getDevicesByIds(deviceIds);
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
   * @param {number} deviceId
   * @param {UpdateTelemetryDevice} device
   * @returns {*} {Promise<string>}
   */
  async updateDevice(deviceId: number, device: UpdateTelemetryDevice): Promise<DeviceRecord> {
    return this.telemetryDeviceRepository.updateDevice(deviceId, device);
  }
}
