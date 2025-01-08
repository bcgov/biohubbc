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
 * @param {SurveySamplePeriodDetails[]} samplingPeriods - All available sampling periods for the survey, used for
 * mapping names to IDs.
 * @return {*}  {({ samplePeriodId: number; sampleSiteId: number | null; methodTechniqueId: number | null } | null)} The
 * sampling data with IDs, or null if no valid data is found.
 */
export function pullSamplingDataFromWorksheetRowObject(
  row: Record<string, any>,
  samplingPeriods: SurveySamplePeriodDetails[]
): { samplePeriodId: number; sampleSiteId: number | null; methodTechniqueId: number | null } | null {
  // Extract site, technique, and period data from the row
  const siteName = getColumnCellValue(row, 'SAMPLING_SITE').cell as string | null;
  const techniqueName = getColumnCellValue(row, 'METHOD_TECHNIQUE').cell as string | null;
  const period = getColumnCellValue(row, 'SAMPLING_PERIOD').cell as string | null;

  // Find all periods that match the site, if one exists in the data
  let periodsMatchingSite: SurveySamplePeriodDetails[] = [];
  if (siteName) {
    periodsMatchingSite = _findSamplePeriodFromWorksheetSite(siteName, samplingPeriods);
  }

  // Find all periods that match the technique, if one exists in the data
  let periodsMatchingTechnique: SurveySamplePeriodDetails[] = [];
  if (techniqueName) {
    // Filter periods by technique name, if one is provided
    periodsMatchingTechnique = _findSamplePeriodFromWorksheetTechnique(techniqueName, samplingPeriods);
  }

  // Find all periods that match the period, if one exists in the data
  let periodsMatchingPeriod: SurveySamplePeriodDetails[] = [];
  if (period) {
    // Filter periods by period, if one is provided
    periodsMatchingPeriod = _findSamplePeriodFromWorksheetPeriod(period, samplingPeriods);
  }

  // Cross-reference the above 3 arrays, and return the period that matches the most filters
  const matchingPeriods = _findMostCompatiblePeriod(
    periodsMatchingSite,
    periodsMatchingTechnique,
    periodsMatchingPeriod
  );
  if (matchingPeriods.length === 1) {
    // Found exactly one period that matches some or all of the filters above
    return _formatMatchingPeriod(matchingPeriods[0]);
  }

  // If no single period was matched above, then attempt to find a suitable period based on the observation date and time
  const observationDate = getColumnCellValue(row, 'DATE').cell as string | null;
  const observationTime = getColumnCellValue(row, 'TIME').cell as string | null;

  const suitablePeriods = _findSamplePeriodFromWorksheetDateAndTime(observationDate, observationTime, samplingPeriods);

  if (suitablePeriods.length) {
    // If at least one period is found, return the first one
    return _formatMatchingPeriod(suitablePeriods[0]);
  }

  // Unable to match this observation record to any existing period
  return null;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will take a site name and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} siteName
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}  {SurveySamplePeriodDetails[]}
 */
function _findSamplePeriodFromWorksheetSite(
  siteName: string,
  samplingPeriods: SurveySamplePeriodDetails[]
): SurveySamplePeriodDetails[] {
  return samplingPeriods.filter((period: any) => period.survey_sample_site.name === siteName);
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will take a technique name and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} techniqueName
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}  {SurveySamplePeriodDetails[]}
 */
function _findSamplePeriodFromWorksheetTechnique(
  techniqueName: string,
  samplingPeriods: SurveySamplePeriodDetails[]
): SurveySamplePeriodDetails[] {
  return samplingPeriods.filter((period: any) => period.method_technique.name === techniqueName);
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will take a period string and find all matching sampling periods from the provided samplingPeriods.
 *
 * @param {string} period A string in the format "YYYY-MM-DDTHH:mm:ss - YYYY-MM-DDTHH:mm:ss", or a valid subset or
 * superset. (Ex: "2024-07-28 - 2024-07-29", "2024-07-28T00:00:00 - 2024-07-29T23:59:59", etc)
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}  {SurveySamplePeriodDetails[]}
 */
function _findSamplePeriodFromWorksheetPeriod(
  period: string,
  samplingPeriods: SurveySamplePeriodDetails[]
): SurveySamplePeriodDetails[] {
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
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will take the periods found by site, technique, and period and return the period(s) that match the most filters.
 *
 * @param {SurveySamplePeriodDetails[]} periodsBySite
 * @param {SurveySamplePeriodDetails[]} periodsbyTechnique
 * @param {SurveySamplePeriodDetails[]} periodsByPeriod
 * @return {*}  {SurveySamplePeriodDetails[]}
 */
function _findMostCompatiblePeriod(
  periodsBySite: SurveySamplePeriodDetails[],
  periodsbyTechnique: SurveySamplePeriodDetails[],
  periodsByPeriod: SurveySamplePeriodDetails[]
): SurveySamplePeriodDetails[] {
  const allPeriodArrays = [periodsBySite, periodsbyTechnique, periodsByPeriod];
  const periodFrequency = new Map<number, { count: number; period: SurveySamplePeriodDetails }>();

  // Iterate through all periods and count how many times a survey_sample_period_id appears in the arrays
  for (const periodArray of allPeriodArrays) {
    for (const period of periodArray) {
      const periodId = period.survey_sample_period_id;

      if (!periodFrequency.has(periodId)) {
        periodFrequency.set(periodId, { count: 0, period: period });
      }

      periodFrequency.get(periodId)!.count += 1;
    }
  }

  // Find the period with the highest count
  let matchingPeriods: SurveySamplePeriodDetails[] = [];
  let maxCount = 0;

  for (const { count, period } of periodFrequency.values()) {
    if (count > maxCount) {
      maxCount = count;
      matchingPeriods = [period];
    } else if (count === maxCount) {
      matchingPeriods.push(period);
    }
  }

  return matchingPeriods;
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
    samplePeriodId: period.survey_sample_period_id,
    sampleSiteId: period.survey_sample_site_id,
    methodTechniqueId: period.method_technique_id
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
