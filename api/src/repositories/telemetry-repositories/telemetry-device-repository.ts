import { z } from 'zod';
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
   * @param {surveyId} surveyId
   * @param {number[]} deviceIds
   * @returns {*} {Promise<DeviceRecord[]>}
   */
  async getDevicesByIds(surveyId: number, deviceIds: number[]): Promise<DeviceRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(['d.device_id', 'd.survey_id', 'd.device_key', 'd.serial', 'd.device_make_id', 'd.model', 'd.comment'])
      .from({ d: 'device' })
      .join({ dm: 'device_make' }, 'd.device_make_id', 'dm.device_make_id')
      .whereIn('device_id', deviceIds)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    return response.rows;
  }

  /**
   * Delete a list of devices by their IDs.
   *
   * @param {surveyId} surveyId
   * @param {number[]} deviceIds
   * @returns {*} {Promise<Array<{ device_id: string }>>}
   */
  async deleteDevicesByIds(surveyId: number, deviceIds: number[]): Promise<Array<{ device_id: number }>> {
    const knex = getKnex();

    const queryBuilder = knex
      .delete()
      .from('device')
      .whereIn('device_id', deviceIds)
      .andWhere({ survey_id: surveyId })
      .returning(['device_id']);

    const response = await this.connection.knex(queryBuilder, z.object({ device_id: z.number() }));

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
   * @param {surveyId} surveyId
   * @param {number} deviceId
   * @param {UpdateTelemetryDevice} device
   * @returns {*} {Promise<DeviceRecord>}
   */
  async updateDevice(surveyId: number, deviceId: number, device: UpdateTelemetryDevice): Promise<DeviceRecord> {
    const knex = getKnex();

    const queryBuilder = knex
      .update(device)
      .from('device')
      .where({ device_id: deviceId, survey_id: surveyId })
      .returning(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment']);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Device was not updated', ['TelemetryDeviceRepository -> updateDevice']);
    }

    return response.rows[0];
  }
}
