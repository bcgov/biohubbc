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
 *
 * @param {ExtendedDeploymentRecord[]} matchingDeployments Telemetry device matchingDeployments
 * @param {Map<string, ICritterDetailed>} surveyCritterAliasMap The critter alias map
 * @param {CSVConfigUtils<TelemetryCSVStaticHeader>} utils The CSV config utils
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTelemetrySerialCellValidator = (
  matchingDeployments: ExtendedDeploymentRecord[],
  surveyCritterAliasMap: Map<string, ICritterDetailed>,
  utils: CSVConfigUtils<TelemetryCSVStaticHeader>
): CSVCellValidator => {
  const deploymentMap = new CaseInsensitiveMap<string, ExtendedDeploymentRecord[]>();

  // Populate the dictionary: device_key -> deployment[]
  for (const deployment of matchingDeployments) {
    const existingDeployment = deploymentMap.get(deployment.device_key);

    // Append to the existing deployment list
    if (existingDeployment) {
      deploymentMap.set(deployment.device_key, [...existingDeployment, deployment]);
      continue;
    }

    // Create a new list for the deployment
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

      // reduce the matchingDeployments to only those that match the critter alias
      matchingDeployments = matchingDeployments.filter(
        (deployment) => deployment.critterbase_critter_id === critter?.critter_id
      );

      if (matchingDeployments.length === 0) {
        return [
          {
            error: `Device and alias does not match any deployments for the critter`,
            solution: `Check that the serial number and vendor match a deployment in the Survey`
          }
        ];
      }
    }

    // Found single deployment
    if (matchingDeployments.length === 1) {
      params.mutateCell = matchingDeployments[0].deployment_id;
      return [];
    }

    // Filter the matchingDeployments by the telemetry acquisition date
    const deploymentsMatchingAcquisitionTimestamp = matchingDeployments.filter((deployment) => {
      const startDate = dayjs(deployment.attachment_start_timestamp);

      if (deployment.attachment_end_timestamp === null) {
        return acquisitionTimestamp.isSameOrAfter(startDate);
      }

      const endDate = dayjs(deployment.attachment_end_timestamp);

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
