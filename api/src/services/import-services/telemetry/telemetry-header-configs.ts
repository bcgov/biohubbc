import dayjs from 'dayjs';
import { ExtendedDeploymentRecord } from '../../../repositories/telemetry-repositories/telemetry-deployment-repository.interface';
import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { CSVConfigUtils } from '../../../utils/csv-utils/csv-config-utils';
import { CSVCellValidator } from '../../../utils/csv-utils/csv-config-validation.interface';
import { newDayjs } from '../../../utils/date-time-utils';
import { setToLowercase } from '../../../utils/string-utils';
import { ICritterDetailed } from '../../critterbase-service';
import { getTelemetryDeviceKey } from '../../telemetry-services/telemetry-utils';
import { TelemetryCSVStaticHeader } from './import-telemetry-service';

/**
 * Get a cell validator for the vendor column in a Telemetry CSV.
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTelemetryVendorCellValidator = (vendors: Set<string>): CSVCellValidator => {
  const vendorsLowerCased = setToLowercase(vendors);

  return (params) => {
    if (vendorsLowerCased.has(String(params.cell).toLowerCase())) {
      return [];
    }

    return [
      {
        error: `Telemetry vendor not supported`,
        solution: `Use a valid telemetry vendor`,
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
 *  3. If the device matches multiple deployments and an alias is provided, the alias must match the critter alias in the deployment
 *  4. If the device matches multiple deployments, the acquisition date must be between the deployment start and end dates
 *
 * @param {ExtendedDeploymentRecord[]} deployments Telemetry device deployments
 * @param {Map<string, ICritterDetailed>} surveyCritterAliasMap The critter alias map
 * @param {CSVConfigUtils<TelemetryCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTelemetrySerialCellValidator = (
  deployments: ExtendedDeploymentRecord[],
  surveyCritterAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<TelemetryCSVStaticHeader>
): CSVCellValidator => {
  const deploymentMap = new CaseInsensitiveMap<string, ExtendedDeploymentRecord[]>();

  // Populate the dictionary: device_key -> deployment[]
  for (const deployment of deployments) {
    const existingDeployments = deploymentMap.get(deployment.device_key);

    // Append to the existing deployment to the device deployments map
    if (existingDeployments) {
      deploymentMap.set(deployment.device_key, [...existingDeployments, deployment]);
      continue;
    }

    // Create a new entry in the device deployments map
    deploymentMap.set(deployment.device_key, [deployment]);
  }

  return (params) => {
    const serial = Number(params.cell);
    const vendor = String(utils.getCellValue('VENDOR', params.row)).toLowerCase();
    const alias = utils.getCellValue('ALIAS', params.row) as string | undefined;
    const acquisitionDate = String(utils.getCellValue('DATE', params.row));
    const acquisitionTime = utils.getCellValue('TIME', params.row) as string | undefined;

    const acquisitionTimestamp = newDayjs(acquisitionDate, acquisitionTime);
    const deviceKey = getTelemetryDeviceKey({ vendor, serial });
    let matchingDeployments = deploymentMap.get(deviceKey);

    // Device does not match any matchingDeployments
    if (!matchingDeployments || matchingDeployments.length === 0) {
      return [
        {
          error: `Device not found in deployments`,
          solution: `Check that the serial number and vendor match a deployment in the Survey`
        }
      ];
    }

    // If an alias is provided, attempt to match the alias to a deployment
    if (alias) {
      const critter = surveyCritterAliasMap.get(alias);

      // Reduce the matchingDeployments to only those that match the critter alias
      matchingDeployments = matchingDeployments.filter(
        (deployment) => deployment.critterbase_critter_id === critter?.critter_id
      );

      // Device matches multiple matchingDeployments, but the critter does not match the critter in the deployment
      if (matchingDeployments.length === 0) {
        return [
          {
            error: `Device and alias does not match any deployments for the critter`,
            solution: `Check that the serial number, vendor and critter alias match a deployment in the Survey`
          }
        ];
      }
    }

    // Found single deployment
    if (matchingDeployments.length === 1) {
      params.mutateCell = matchingDeployments[0].deployment_id;
      return [];
    }

    // Filter the matchingDeployments to only those that have the telemetry acquisition date between the deployment start and end dates
    const deploymentsMatchingAcquisitionTimestamp = matchingDeployments.filter((deployment) => {
      const startDate = dayjs(deployment.attachment_start_timestamp);

      // When the deployment has no end date, the telemetry acquisition date must be after the start date
      if (deployment.attachment_end_timestamp === null) {
        return acquisitionTimestamp.isSameOrAfter(startDate);
      }

      const endDate = dayjs(deployment.attachment_end_timestamp);

      // Telemetry acquisition date must be between the deployment start and end dates
      return acquisitionTimestamp.isSameOrBefore(endDate) && acquisitionTimestamp.isSameOrAfter(startDate);
    });

    // Device matches multiple matchingDeployments, but telemetry is between the deployment start and end dates
    if (deploymentsMatchingAcquisitionTimestamp.length === 1) {
      params.mutateCell = deploymentsMatchingAcquisitionTimestamp[0].deployment_id;
      return [];
    }

    return [
      {
        error: 'Unable to uniquely identify deployment using device, vendor, alias, and acquisition date',
        solution: 'Check that the serial number and vendor match a single deployment in the Survey'
      }
    ];
  };
};
