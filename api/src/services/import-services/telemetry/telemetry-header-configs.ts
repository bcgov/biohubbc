import { ExtendedDeploymentRecord } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { TelemetryCSVStaticHeader } from './import-telemetry-service';

/**
 * Get a cell validator for the vendor column in a Telemetry CSV.
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTelemetryVendorCellValidator = (vendors: Set<string>): CSVCellValidator => {
  return (params) => {
    if (vendors.has(String(params.cell).toLowerCase())) {
      return [];
    }

    return [
      {
        error: `Vendor not supported`,
        solution: `Use a valid vendor`,
        values: Array.from(vendors)
      }
    ];
  };
};

/**
 * Get a cell validator for the serial number column in a Telemetry CSV.
 *
 * Rules:
 *  1. The serial and vendor must generate a valid device key
 *  2. The device key must exist in the deployment dictionary
 *
 * @param {ExtendedDeploymentRecord[]} deployments Telemetry device deployments
 * @param {CSVConfigUtils<TelemetryCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTelemetrySerialCellValidator = (
  deployments: ExtendedDeploymentRecord[],
  utils: CSVConfigUtils<TelemetryCSVStaticHeader>
): CSVCellValidator => {
  const dictionary = new Map<string, ExtendedDeploymentRecord>();

  // Populate the dictionary: device_key -> deployment
  for (const deployment of deployments) {
    dictionary.set(deployment.device_key, deployment);
  }

  return (params) => {
    const serial = Number(params.cell);
    const vendor = utils.getCellValue('VENDOR', params.row);
    const deviceKey = getTelemetryDeviceKey({ vendor, serial });
    const deployment = dictionary.get(deviceKey);

    if (!deployment) {
      return [
        {
          error: `Device not found in survey`,
          solution: `Check the serial number and vendor are correct`
        }
      ];
    }

    // Mutate the cell to the deployment ID
    params.mutateCell = deployment.deployment_id;

    // TODO: Keeping for when we support "CSVWarnings" in the CSV import
    //
    //const timestampInDeploymentRange =
    //  timestamp >= deployment.attachment_start_timestamp &&
    //  (deployment.attachment_end_timestamp === null || timestamp <= deployment.attachment_end_timestamp);
    //
    //if (!timestampInDeploymentRange) {
    //  return [
    //    {
    //      error: `Timestamp not within deployment range`,
    //      solution: `Check the telemetry timestamp is within the deployment range`
    //    }
    //  ];
    //}

    return [];
  };
};
