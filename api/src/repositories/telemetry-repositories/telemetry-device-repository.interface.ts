import { DeviceRecord } from '../../database-models/device';

/**
 * Interface reflecting the telemetry device data required to create a new device
 *
 */
export type CreateTelemetryDevice = Pick<DeviceRecord, 'survey_id' | 'serial' | 'device_make_id' | 'model' | 'comment'>;

/**
 * Interface reflecting the telemetry device data required to update an existing device
 *
 */
export type UpdateTelemetryDevice = Partial<Pick<DeviceRecord, 'serial' | 'device_make_id' | 'model' | 'comment'>>;

/**
 * Interface for the advanced filters that can be applied to the find devices request.
 *
 */
export type DeviceAdvancedFilters = {
  /**
   * The keyword to search for in the device model, comment, or serial number
   */
  keyword?: string;
  /**
   * The system user id to filter devices by.
   *
   * Note: This is not the system user id of the user making the request, but the system user id of the user whose
   * devices you want to return.
   *
   * @type {number}
   */
  system_user_id?: number;
};
