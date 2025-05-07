import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { DeviceRecord } from '../../../database-models/device';
import { DeploymentCSVStaticHeader } from './import-deployment-service';



/**
 * Get a cell validator for the serial number column in a Deployment CSV.
 *
 * Rules:
 *  1. The serial and vendor must generate a valid device key
 *  2. The device key must exist in the deployment dictionary
 *
 * @param {CSVConfigUtils<DeploymentCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDeviceSerialCellValidator = (
  devices: DeviceRecord[],
  utils: CSVConfigUtils<DeploymentCSVStaticHeader>
): CSVCellValidator => {
  const deviceMap = new CaseInsensitiveMap<string, DeviceRecord[]>();

  // Populate the dictionary: device_key -> deployment[]
  for (const device of devices) {
    const existingdevices = deviceMap.get(device.device_key);

    // Append to the existing device to the device devices map
    if (existingdevices) {
      deviceMap.set(device.device_key, [...existingdevices, device]);
      continue;
    }

    // Create a new entry in the device devices map
    deviceMap.set(device.device_key, [device]);
  }

  return (params) => {
    const serial = Number(params.cell);
    const vendor = String(utils.getCellValue('VENDOR', params.row)).toLowerCase();
    const deviceKey = getTelemetryDeviceKey({ vendor, serial });

    // Rule: Validate device key exists in the device map
    if (!deviceMap.has(deviceKey)) {
      return [{
        isValid: false,
        message: `Device key '${deviceKey}' does not exist in the deployment dictionary.`,
        error: 'InvalidDeviceKey',
        solution: 'Ensure the device key exists in the deployment dictionary.'
      }];
    }

    return [];
  };
};
