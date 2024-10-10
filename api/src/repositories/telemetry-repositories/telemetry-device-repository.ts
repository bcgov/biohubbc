import { DeviceRecord } from '../../database-models/device';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { BaseRepository } from '../base-repository';
import { CreateTelemetryDevice, UpdateTelemetryDevice } from './telemetry-device-repository.interface';

/**
 * A repository class for accessing telemetry device data.
 *
 * @export
 * @class TelemetryDeviceRepository
 * @extends {BaseRepository}
 */
export class TelemetryDeviceRepository extends BaseRepository {
  /**
   * Get a list of devices by their IDs.
   *
   * @param {number[]} deviceIds
   * @returns {*} {Promise<DeviceRecord[]>}
   *
   */
  async getDevicesByIds(deviceIds: number[]): Promise<DeviceRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select()
      .from('device')
      .where({ device_id: deviceIds })
      .returning(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment']);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    return response.rows;
  }

  /**
   * Create a new device record.
   *
   * @param {CreateTelemetryDevice} device
   * @returns {*} {Promise<DeviceRecord>}
   */
  async createDevice(device: CreateTelemetryDevice): Promise<DeviceRecord> {
    const knex = getKnex();

    const queryBuilder = knex
      .insert(device)
      .into('device')
      .returning(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment']);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Device was not created', ['TelemetryDeviceRepository -> createDevice']);
    }

    return response.rows[0];
  }

  /**
   * Update an existing device record.
   *
   * @param {number} deviceId
   * @param {UpdateTelemetryDevice} device
   * @returns {*} {Promise<string>}
   */
  async updateDevice(deviceId: number, device: UpdateTelemetryDevice): Promise<DeviceRecord> {
    const knex = getKnex();

    const queryBuilder = knex
      .update(device)
      .from('device')
      .where({ device_id: deviceId })
      .returning(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment']);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Device was not updated', ['TelemetryDeviceRepository -> updateDevice']);
    }

    return response.rows[0];
  }
}
