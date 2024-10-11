import { z } from 'zod';
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
 * Interface for a device with the device make included
 *
 */
export const DeviceWithMake = DeviceRecord.extend({ device_make: z.string() });
export type DeviceWithMake = z.infer<typeof DeviceWithMake>;
