import { DeviceRecord } from '../../database-models/device';
import { IDBConnection } from '../../database/db';
import { ApiGeneralError } from '../../errors/api-error';
import { TelemetryDeviceRepository } from '../../repositories/telemetry-repositories/telemetry-device-repository';
import {
  CreateTelemetryDevice,
  DeviceAdvancedFilters,
  UpdateTelemetryDevice
} from '../../repositories/telemetry-repositories/telemetry-device-repository.interface';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
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
   * Create a new device record.
   *
   * @param {CreateTelemetryDevice} device
   * @returns {*} {Promise<DeviceRecord>}
   */
  async createDevice(device: CreateTelemetryDevice): Promise<DeviceRecord> {
    return this.telemetryDeviceRepository.createDevice(device);
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
  async getDevice(surveyId: number, deviceId: number): Promise<DeviceRecord> {
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
   *
   */
  async getDevices(surveyId: number, deviceIds: number[]): Promise<DeviceRecord[]> {
    return this.telemetryDeviceRepository.getDevicesByIds(surveyId, deviceIds);
  }

  /**
   * Get all devices for a survey, based on pagination options.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<DeviceRecord[]>}
   * @memberof TelemetryDeviceService
   */
  async getDevicesForSurvey(surveyId: number, pagination?: ApiPaginationOptions): Promise<DeviceRecord[]> {
    return this.telemetryDeviceRepository.getDevicesForSurvey(surveyId, pagination);
  }

  /**
   * Find devices.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {(number | null)} systemUserId The user's ID.
   * @param {DeviceAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {*}  {Promise<DeviceRecord[]>}
   * @memberof TelemetryDeviceService
   *
   */
  async findDevices(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: DeviceAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<DeviceRecord[]> {
    return this.telemetryDeviceRepository.findDevices(isUserAdmin, systemUserId, filterFields, pagination);
  }

  /**
   * Get the total count of all devices for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof TelemetryDeviceService
   */
  async getDevicesCount(surveyId: number): Promise<number> {
    return this.telemetryDeviceRepository.getDevicesCount(surveyId);
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
   * Deletes one or more devices by ID.
   *
   * @param {number} surveyId
   * @param {number[]} deviceIds
   * @return {*}  {Promise<void>}
   * @memberof TelemetryDeviceService
   */
  async deleteDevices(surveyId: number, deviceIds: number[]): Promise<void> {
    const devices = await this.telemetryDeviceRepository.deleteDevicesByIds(surveyId, deviceIds);

    if (devices.length !== deviceIds.length) {
      throw new ApiGeneralError('Unable to delete devices', [
        'TelemetryDeviceService -> deleteDevices',
        `Expected ${deviceIds.length} devices to be deleted, but only ${devices.length} were deleted.`
      ]);
    }
  }
}
