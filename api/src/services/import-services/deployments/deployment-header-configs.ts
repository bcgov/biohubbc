import { DeviceRecord } from '../../../database-models/device';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { setToLowercase } from '../../../utils/string-utils';
import { ICaptureDetailed } from '../../critterbase-service';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { updateCSVRowState } from '../utils/row-state';
import { DeploymentCSVStaticHeader } from './import-deployment-service';

/**
 * Get the deployment critter alias cell validator.
 * This validator maps aliases directly to SIMS internal critter_id (integer).
 *
 * Rules:
 *  1. The alias must exist in the deployment alias map
 *  2. Updates row state with SIMS internal critter_id
 *
 * @param {Map<string, number>} deploymentAliasMap Map of alias (lowercase) → SIMS critter_id (integer)
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDeploymentCritterAliasCellValidator = (deploymentAliasMap: Map<string, number>): CSVCellValidator => {
  return (params) => {
    if (params.cell === undefined) {
      return [
        {
          error: 'Cell is required',
          solution: 'Use a valid critter alias that exists in the Survey'
        }
      ];
    }

    const alias = String(params.cell).toLowerCase();
    const simscritterId = deploymentAliasMap.get(alias);

    if (simscritterId === undefined) {
      return [
        {
          error: `Unable to find a matching survey critter`,
          solution: `Use a valid critter alias that exists in the Survey`
        }
      ];
    }

    // Update the row state with the SIMS internal critter ID (integer)
    updateCSVRowState(params.row, { critterId: simscritterId });

    return [];
  };
};

/**
 * Get a cell validator for the frequency column in a Deployment CSV.
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getFrequencyUnitCellValidator = (frequency_units: Set<string>): CSVCellValidator => {
  const frequency_unitsLowerCased = setToLowercase(frequency_units);

  return (params) => {
    if (frequency_unitsLowerCased.has(String(params.cell).toLowerCase())) {
      return [];
    }

    return [
      {
        error: `Frequency unit not supported`,
        solution: `Use a valid frequency unit`,
        values: Array.from(frequency_units)
      }
    ];
  };
};

export const getCritterCaptureCellValidator = (captures: ICaptureDetailed[]): CSVCellValidator => {
  return (params) => {
    const capture = captures.find((capture) => params.cell === capture.capture_date);

    if (!capture) {
      return [
        {
          error: 'Capture date not found',
          message: `There is no capture on ${params.cell}.`,
          solution: 'Create a capture for this date or correct the date in your csv.'
        }
      ];
    }

    return [];
  };
};

/**
 * Get a cell validator for the serial number column in a Deployment CSV.
 *
 * Rules:
 *  1. The serial and vendor must generate a valid device key
 *  2. The device key must exist in the device dictionary
 *  3. Updates row state with device_id
 *
 * @param {DeviceRecord[]} devices The list of devices for the survey
 * @param {CSVConfigUtils<DeploymentCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getDeviceSerialCellValidator = (
  devices: DeviceRecord[],
  utils: CSVConfigUtils<DeploymentCSVStaticHeader>
): CSVCellValidator => {
  const deviceMap = new CaseInsensitiveMap<string, DeviceRecord>();

  // Populate the dictionary: device_key -> device
  for (const device of devices) {
    deviceMap.set(device.device_key, device);
  }

  return (params) => {
    const serial = Number(params.cell);
    const vendor = String(utils.getCellValue('VENDOR', params.row)).toLowerCase();
    const deviceKey = getTelemetryDeviceKey({ vendor, serial });

    // Rule: Validate device key exists in the device map
    const matchingDevice = deviceMap.get(deviceKey);
    if (!matchingDevice) {
      return [
        {
          error: `Device not found`,
          solution: `Check that the serial number '${serial}' and vendor '${vendor}' match a device in the Survey`
        }
      ];
    }

    // Update the row state with the device ID
    updateCSVRowState(params.row, { deviceId: matchingDevice.device_id });

    return [];
  };
};
