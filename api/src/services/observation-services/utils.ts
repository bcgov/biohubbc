import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DefaultDateFormat } from '../../constants/dates';
import { SurveySamplePeriodDetails } from '../../repositories/sample-period-repository';
import {
  EnvironmentNameTypeDefinitionMap,
  isEnvironmentQualitativeTypeDefinition
} from '../../utils/observation-xlsx-utils/environment-column-utils';
import {
  getMeasurementFromTsnMeasurementTypeDefinitionMap,
  isMeasurementCBQualitativeTypeDefinition,
  TsnMeasurementTypeDefinitionMap
} from '../../utils/observation-xlsx-utils/measurement-column-utils';
import { getColumnCellValue, InsertSubCount } from './observation-service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Extracts sampling data from the worksheet row object and maps site names, method techniques, and periods
 * to their respective IDs using the provided samplingPeriods.
 *
 * @param {Record<string, any>} row - The current row of the worksheet being processed.
 * @param {SurveySamplePeriodDetails[]} samplingPeriods - The available sampling periods for the survey, used for
 * mapping names to IDs.
 * @return { { sampleSiteId: number, methodTechniqueId: number, samplePeriodId: number } | null } The sampling data with
 * IDs, or null if no valid data is found.
 */
export function pullSamplingDataFromWorksheetRowObject(
  row: Record<string, any>,
  samplingPeriods: SurveySamplePeriodDetails[]
): { sampleSiteId: number; methodTechniqueId: number; samplePeriodId: number } | null {
  // Extract site, technique, and period data from the row
  const siteName = getColumnCellValue(row, 'SAMPLING_SITE').cell as string | null;
  const techniqueName = getColumnCellValue(row, 'METHOD_TECHNIQUE').cell as string | null;
  const period = getColumnCellValue(row, 'SAMPLING_PERIOD').cell as string | null;

  let matchingPeriods1 = samplingPeriods;
  if (siteName) {
    // Filter periods by site name, if one is provided
    matchingPeriods1 = _findSamplePeriodFromWorksheetSite(siteName, matchingPeriods1);
  }

  let matchingPeriods2 = matchingPeriods1;
  if (techniqueName) {
    // Filter periods by technique name, if one is provided
    matchingPeriods2 = _findSamplePeriodFromWorksheetTechnique(techniqueName, matchingPeriods2);
  }

  let matchingPeriods3 = matchingPeriods2;
  if (period) {
    // Filter periods by period, if one is provided
    matchingPeriods3 = _findSamplePeriodFromWorksheetPeriod(period, matchingPeriods3);
  }

  if (matchingPeriods3.length === 1) {
    // If exactly one period matches after applying some or all of the above filters, then return it
    return _formatMatchingPeriod(matchingPeriods3[0]);
  }

  // If no single period was matched above, then attempt to find an suitable existing  period based on the observation
  // date and time values
  const observationDate = getColumnCellValue(row, 'DATE').cell as string | null;
  const observationTime = getColumnCellValue(row, 'TIME').cell as string | null;

  const suitablePeriods = _findSamplePeriodFromWorksheetDateAndTime(observationDate, observationTime, samplingPeriods);

  if (suitablePeriods.length) {
    // If at least one suitable period is found, return the first one
    return _formatMatchingPeriod(suitablePeriods[0]);
  }

  // If no suitable period is found above, return the first matching period from the original filters, in decreasing
  // order of specificity, if any yield a single match
  if (matchingPeriods2.length === 1) {
    return _formatMatchingPeriod(matchingPeriods2[0]);
  }

  if (matchingPeriods1.length === 1) {
    return _formatMatchingPeriod(matchingPeriods1[0]);
  }

  // Unable to match this observation record to any single period
  return null;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function. It will take a site name
 * and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} site
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}
 */
function _findSamplePeriodFromWorksheetSite(site: string, samplingPeriods: SurveySamplePeriodDetails[]) {
  return samplingPeriods.filter((period: any) => period.survey_sample_site.name === site);
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function. It will take a technique
 * name and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} technique
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}
 */
function _findSamplePeriodFromWorksheetTechnique(technique: string, samplingPeriods: SurveySamplePeriodDetails[]) {
  return samplingPeriods.filter((period: any) => period.method_technique.name === technique);
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function. It will take a period
 * string and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} period
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}
 */
function _findSamplePeriodFromWorksheetPeriod(period: string, samplingPeriods: SurveySamplePeriodDetails[]) {
  // Format the period timestamp data
  const [startDate, endDate] = period.split('-').map((date: string) => dayjs(date).format(DefaultDateFormat));
  const startTime = dayjs(period.split('-')[0]).format('HH:mm:ss');
  const endTime = dayjs(period.split('-')[1]).format('HH:mm:ss');

  // Find matching periods by date
  let matchingPeriods = samplingPeriods.filter(
    (period: any) => period.start_date === startDate && period.end_date === endDate
  );

  // Return if exactly one period matches by date
  if (matchingPeriods.length === 1) {
    return matchingPeriods;
  }

  // If multiple periods match by date, try matching additionally by time
  matchingPeriods = matchingPeriods.filter(
    (period: any) => period.start_time === startTime && period.end_time === endTime
  );

  return matchingPeriods;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function. It will take an
 * observation date and time and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {(string | null)} observationDate
 * @param {(string | null)} observationTime
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}
 */
function _findSamplePeriodFromWorksheetDateAndTime(
  observationDate: string | null,
  observationTime: string | null,
  samplingPeriods: SurveySamplePeriodDetails[]
) {
  const formattedObservationDate = dayjs(observationDate);
  const formattedObservationTime = dayjs(`${observationDate} ${observationTime}`).format('HH:mm:ss');

  // TODO: Fix timezone of the observation date. Observation date is assumed to be UTC instead of local time,
  // so the observation date being imported from the csv is incorrectly offset by 1 day. eg. "July 28, 2024" is
  // imported at July 27, 2024

  const suitablePeriods = samplingPeriods.filter((samplingPeriod) => {
    return (
      formattedObservationDate.isSameOrAfter(dayjs(samplingPeriod.start_date)) &&
      formattedObservationDate.isSameOrBefore(dayjs(samplingPeriod.end_date)) &&
      (!samplingPeriod.start_time ||
        formattedObservationTime >=
          dayjs(`${samplingPeriod.start_date} ${samplingPeriod.start_time}`).format('HH:mm:ss')) &&
      (!samplingPeriod.end_time ||
        formattedObservationTime <= dayjs(`${samplingPeriod.end_date} ${samplingPeriod.end_time}`).format('HH:mm:ss'))
    );
  });

  return suitablePeriods;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function. It will take a matching
 * period and format it to return the sample site, method technique, and sample period IDs.
 *
 * @param {SurveySamplePeriodDetails} period
 * @return {*}
 */
function _formatMatchingPeriod(period: SurveySamplePeriodDetails) {
  return {
    sampleSiteId: period.survey_sample_site_id,
    methodTechniqueId: period.method_technique_id,
    samplePeriodId: period.survey_sample_period_id
  };
}

/**
 * This function is a helper method for the `processObservationCsvSubmission` function. It will take row data from an
 * uploaded CSV and find and connect the CSV measurement data with proper measurement taxon ids (UUIDs) from the
 * TsnMeasurementTypeDefinitionMap passed in. Any qualitative and quantitative measurements found are returned to be
 * inserted into the database. This function assumes that the data in the CSV has already been validated.
 *
 * @param {Record<string, any>} row A worksheet row object from a CSV that was uploaded for processing
 * @param {string[]} measurementColumns A list of the measurement columns found in a CSV uploaded
 * @param {TsnMeasurementTypeDefinitionMap} tsnMeasurements Map of TSNs and their valid measurements
 * @return {*}  {(Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'>)}
 * @memberof ObservationService
 */
export function pullMeasurementsFromWorkSheetRowObject(
  row: Record<string, any>,
  measurementColumns: string[],
  tsnMeasurements: TsnMeasurementTypeDefinitionMap
): Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'> {
  const foundMeasurements: Pick<InsertSubCount, 'qualitative_measurements' | 'quantitative_measurements'> = {
    qualitative_measurements: [],
    quantitative_measurements: []
  };

  measurementColumns.forEach((mColumn) => {
    // Ignore blank columns
    if (!mColumn) {
      return;
    }

    const rowData = row[mColumn];

    // Ignore empty rows
    if (rowData === undefined) {
      return;
    }

    const measurement = getMeasurementFromTsnMeasurementTypeDefinitionMap(
      getColumnCellValue(row, 'ITIS_TSN').cell as string,
      mColumn,
      tsnMeasurements
    );

    // Ignore empty measurements
    if (!measurement) {
      return;
    }

    // if measurement is qualitative, find the option uuid
    if (isMeasurementCBQualitativeTypeDefinition(measurement)) {
      const foundOption = measurement.options.find(
        (option) =>
          option.option_label.toLowerCase() === String(rowData).toLowerCase() ||
          option.option_value === Number(rowData) ||
          option.qualitative_option_id === rowData
      );

      if (!foundOption) {
        return;
      }

      foundMeasurements.qualitative_measurements.push({
        measurement_id: measurement.taxon_measurement_id,
        measurement_option_id: foundOption.qualitative_option_id
      });
    } else {
      foundMeasurements.quantitative_measurements.push({
        measurement_id: measurement.taxon_measurement_id,
        measurement_value: Number(rowData)
      });
    }
  });

  return foundMeasurements;
}

/**
 * This function is a helper method for the `processObservationCsvSubmission` function. It will take row data from an
 * uploaded CSV.
 *
 * @export
 * @param {Record<string, any>} row
 * @param {string[]} environmentColumns
 * @param {EnvironmentNameTypeDefinitionMap} environmentNameTypeDefinitionMap
 * @return {*}  {(Pick<InsertSubCount, 'qualitative_environments' | 'quantitative_environments'>)}
 */
export function pullEnvironmentsFromWorkSheetRowObject(
  row: Record<string, any>,
  environmentColumns: string[],
  environmentNameTypeDefinitionMap: EnvironmentNameTypeDefinitionMap
): Pick<InsertSubCount, 'qualitative_environments' | 'quantitative_environments'> {
  const foundEnvironments: Pick<InsertSubCount, 'qualitative_environments' | 'quantitative_environments'> = {
    qualitative_environments: [],
    quantitative_environments: []
  };

  environmentColumns.forEach((mColumn) => {
    // Ignore blank columns
    if (!mColumn) {
      return;
    }

    const rowData = row[mColumn];

    // Ignore empty rows
    if (rowData === undefined) {
      return;
    }

    const environment = environmentNameTypeDefinitionMap.get(mColumn);

    // Ignore empty environments
    if (!environment) {
      return;
    }

    // if environment is qualitative, find the option id
    if (isEnvironmentQualitativeTypeDefinition(environment)) {
      const foundOption = environment.options.find((option) => option.name === String(rowData).toLowerCase());

      if (!foundOption) {
        return;
      }

      foundEnvironments.qualitative_environments.push({
        environment_qualitative_id: foundOption.environment_qualitative_id,
        environment_qualitative_option_id: foundOption.environment_qualitative_option_id
      });
    } else {
      foundEnvironments.quantitative_environments.push({
        environment_quantitative_id: environment.environment_quantitative_id,
        value: Number(rowData)
      });
    }
  });

  return foundEnvironments;
}
