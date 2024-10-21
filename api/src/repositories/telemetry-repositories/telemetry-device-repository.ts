import { z } from 'zod';
import { DeviceRecord } from '../../database-models/device';
import { getKnex } from '../../database/db';
import { ApiExecuteSQLError } from '../../errors/api-error';
import { ApiPaginationOptions } from '../../zod-schema/pagination';
import { BaseRepository } from '../base-repository';
import {
  CreateTelemetryDevice,
  DeviceAdvancedFilters,
  UpdateTelemetryDevice
} from './telemetry-device-repository.interface';
import { makeFindDevicesQuery } from './telemetry-device-utils';

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
      .select(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment'])
      .from('device')
      .whereIn('device_id', deviceIds)
      .andWhere('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    return response.rows;
  }

  /**
   * Retrieve the list of devices for a survey, based on pagination options.
   *
   * @param {number} surveyId
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<DeviceRecord[]>}
   * @memberof TelemetryDeviceRepository
   */
  async getDevicesForSurvey(surveyId: number, pagination?: ApiPaginationOptions): Promise<DeviceRecord[]> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(['device_id', 'survey_id', 'device_key', 'serial', 'device_make_id', 'model', 'comment'])
      .from('device')
      .where('survey_id', surveyId);

    if (pagination) {
      queryBuilder.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        queryBuilder.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(queryBuilder, DeviceRecord);

    return response.rows;
  }

  /**
   * Retrieve the list of devices that the user has access to, based on filters and pagination options.
   *
   * @param {boolean} isUserAdmin Whether the user is an admin.
   * @param {number | null} systemUserId The user's ID.
   * @param {DeviceAdvancedFilters} filterFields The filter fields to apply.
   * @param {ApiPaginationOptions} [pagination] The pagination options.
   * @return {Promise<DeviceRecord[]>} A promise resolving to the list of devices.
   */
  async findDevices(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: DeviceAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<DeviceRecord[]> {
    const query = makeFindDevicesQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, DeviceRecord);

    return response.rows;
  }

  /**
   * Get the total count of all devices for a survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<number>}
   * @memberof TelemetryDeviceRepository
   */
  async getDevicesCount(surveyId: number): Promise<number> {
    const knex = getKnex();

    const queryBuilder = knex
      .select(knex.raw('count(*)::integer as count'))
      .from('device')
      .where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder, z.object({ count: z.number() }));

    return response.rows[0].count;
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
