import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DefaultDateFormat, DefaultTimeFormat, DefaultTimeFormatNoSeconds } from '../../constants/dates';
import { SurveySamplePeriodDetails } from '../../repositories/sample-period-repository';
import { isDateString, isDateTimeString, isTimeString } from '../../utils/date-time-utils';
import {
  getMeasurementFromTsnMeasurementTypeDefinitionMap,
  isMeasurementCBQualitativeTypeDefinition,
  TsnMeasurementTypeDefinitionMap
} from '../../utils/observation-xlsx-utils/measurement-column-utils';
import { getColumnCellValue, InsertSubCount } from './observation-service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * A helper function that will take a row object from a worksheet and attempt to find a matching sampling period.
 *
 * If the row contains a sampling site, technique, or period, then the function will attempt to find a unique period
 * that matches all of the provided (non-null) values.
 *
 * If the row does not contain a sampling site, technique, and period, then the function will attempt to find a unique
 * period that matches the observation date and time.
 *
 * @param {Record<string, any>} row The current row of the worksheet being processed.
 * @param {SurveySamplePeriodDetails[]} samplingPeriods All available sampling periods for the survey.
 * @return {*}  {({ samplePeriodId: number; sampleSiteId: number | null; methodTechniqueId: number | null } | null)} A
 * matching sampling period object, or null if no periods match the row data.
 */
export function pullSamplingDataFromWorksheetRowObject(
  row: Record<string, any>,
  samplingPeriods: SurveySamplePeriodDetails[]
): { samplePeriodId: number; sampleSiteId: number | null; methodTechniqueId: number | null } | null {
  // Extract site, technique, and period data from the row
  const worksheetSiteName = getColumnCellValue(row, 'SAMPLING_SITE').cell as string | null;
  const worksheetTechniqueName = getColumnCellValue(row, 'METHOD_TECHNIQUE').cell as string | null;
  const worksheetPeriod = getColumnCellValue(row, 'SAMPLING_PERIOD').cell as string | null;

  // If any of the site, technique, or period values are provided, then attempt to find a unique period
  // that matches all of provided (non-null) values.
  if (worksheetSiteName || worksheetTechniqueName || worksheetPeriod) {
    // Find all periods that match the provided site, technique, and period
    // Periods must match all non-null worksheet values to be considered a match
    const matchingPeriodsBySamplingInformation = samplingPeriods.filter((period) => {
      if (worksheetSiteName) {
        const isMatch = matchSamplePeriodToWorksheetSiteName(worksheetSiteName, period);

        if (!isMatch) {
          // If the worksheet site name is provided but does not match, then this period is not a match
          return false;
        }
      }

      if (worksheetTechniqueName) {
        const isMatch = matchSamplePeriodToWorksheetTechniqueName(worksheetTechniqueName, period);

        if (!isMatch) {
          // If the worksheet technique name is provided but does not match, then this period is not a match
          return false;
        }
      }

      if (worksheetPeriod) {
        const isMatch = matchSamplePeriodToWorksheetPeriod(worksheetPeriod, period);

        if (!isMatch) {
          // If the worksheet period is provided but does not match, then this period is not a match
          return false;
        }
      }

      // If all provided (non-null) values match, then consider this period a match
      return true;
    });

    if (matchingPeriodsBySamplingInformation.length === 1) {
      // Found exactly one period record that uniquely matches some or all of the filters above
      return formatMatchingPeriod(matchingPeriodsBySamplingInformation[0]);
    }

    // Unable to match the observation sampling information to any existing period uniquely
    return null;
  }

  // If not site, technique, or period values are provided, then attempt to find a unique period that matches the
  // observation date and time
  const observationDate = getColumnCellValue(row, 'DATE').cell as string | null;
  const observationTime = getColumnCellValue(row, 'TIME').cell as string | null;

  const matchingPeriodsByObservationDateTime = matchSamplePeriodsToObservationDateTime(
    observationDate,
    observationTime,
    samplingPeriods
  );

  if (matchingPeriodsByObservationDateTime.length) {
    // If at least one period record is found that satisfies the observation date and time, then return the first one
    return formatMatchingPeriod(matchingPeriodsByObservationDateTime[0]);
  }

  // Unable to match the observation date/time to any existing period uniquely
  return null;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will compare a worksheet site name to a sampling site object and return true if the names match.
 *
 * @param {string} worksheetSiteName
 * @param {SurveySamplePeriodDetails} samplingPeriod
 * @return {*}  {boolean}
 */
export function matchSamplePeriodToWorksheetSiteName(
  worksheetSiteName: string,
  samplingPeriod: SurveySamplePeriodDetails
): boolean {
  return samplingPeriod.survey_sample_site?.name === worksheetSiteName;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will compare a worksheet technique name to a sampling technique object and return true if the names match.
 *
 * @param {string} worksheetTechniqueName
 * @param {SurveySamplePeriodDetails} samplingPeriod
 * @return {*}  {boolean}
 */
export function matchSamplePeriodToWorksheetTechniqueName(
  worksheetTechniqueName: string,
  samplingPeriod: SurveySamplePeriodDetails
): boolean {
  return samplingPeriod.method_technique?.name === worksheetTechniqueName;
}

/**
 * This function is a helper method for the `pullSamplingDataFromWorksheetRowObject` function.
 *
 * It will compare a worksheet period string to a sampling period object and return true if they match.
 *
 * They must match on start_date and end_date. And optionally match on start_time and end_time if they are present
 * in the worksheet period string.
 *
 * Note: This function relies on the incoming period string to separate the start and end dates with a " - " delimiter.
 *
 * @param {string} period A string in the format "YYYY-MM-DDTHH:mm:ss - YYYY-MM-DDTHH:mm:ss", or a valid subset or
 * superset. (Ex: "2024-07-28 - 2024-07-29", "2024-07-28T00:00:00 - 2024-07-29T23:59:59", etc)
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}  {SurveySamplePeriodDetails}
 */
export function matchSamplePeriodToWorksheetPeriod(
  worksheetPeriod: string,
  samplingPeriod: SurveySamplePeriodDetails
): boolean {
  const [worksheetStartDateTime, worksheetEndDateTime] = worksheetPeriod.split(' - ');

  if (!worksheetStartDateTime || !worksheetEndDateTime) {
    // Failed to split the period string into expected start and end date strings
    return false;
  }

  if (!matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetStartDateTime, samplingPeriod.start_date ?? '')) {
    // Failed to match the start date
    return false;
  }

  if (!matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetEndDateTime, samplingPeriod.end_date ?? '')) {
    // Failed to match the end date
    return false;
  }

  if (!matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetStartDateTime, samplingPeriod.start_time ?? '')) {
    // Failed to match the start time
    return false;
  }

  if (!matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetEndDateTime, samplingPeriod.end_time ?? '')) {
    // Failed to match the end time
    return false;
  }

  // Successfully matched the period
  return true;
}

/**
 * This function is a helper method for the `matchSamplePeriodToWorksheetPeriod` function.
 *
 * It will compare a worksheet date-time string to a sampling period date string and return true if they match.
 *
 * @example
 * matchSamplePeriodDateToWorksheetPeriodDateTime('2021-01-01 11:00:00', '2021-01-01') // true
 * matchSamplePeriodDateToWorksheetPeriodDateTime('2021-01-01', '2021-01-01') // true
 *
 * matchSamplePeriodDateToWorksheetPeriodDateTime('', '') // true
 *
 * matchSamplePeriodDateToWorksheetPeriodDateTime('2021-01-01 11:00:00', '2022-02-02') // false
 * matchSamplePeriodDateToWorksheetPeriodDateTime('2021-01-01', '2022-02-02') // false
 *
 * matchSamplePeriodDateToWorksheetPeriodDateTime('2021-01-01', '') // false
 * matchSamplePeriodDateToWorksheetPeriodDateTime('', '2021-01-01') // false
 *
 * @export
 * @param {string} worksheetDateTimeString
 * @param {string} samplingPeriodDateString
 * @return {*}  {boolean}
 */
export function matchSamplePeriodDateToWorksheetPeriodDateTime(
  worksheetDateTimeString: string,
  samplingPeriodDateString: string
): boolean {
  const isWorksheetDateTimeString = isDateString(worksheetDateTimeString);
  const isSamplingPeriodDateString = isDateString(samplingPeriodDateString);

  if (isWorksheetDateTimeString !== isSamplingPeriodDateString) {
    // If either string contains date information, and the other does not, then they cannot possibly match
    return false;
  }

  if (!isWorksheetDateTimeString && !isSamplingPeriodDateString) {
    // If neither string contains date information, then they are considered to match
    return true;
  }

  const formattedWorksheetDateString = dayjs(worksheetDateTimeString).format(DefaultDateFormat);
  const formattedSamplingPeriodDateString = dayjs(samplingPeriodDateString).format(DefaultDateFormat);

  if (formattedWorksheetDateString !== formattedSamplingPeriodDateString) {
    // Failed to match the date strings
    return false;
  }

  return true;
}

/**
 * This function is a helper method for the `matchSamplePeriodToWorksheetPeriod` function.
 *
 * It will compare a worksheet date-time string to a sampling period time string and return true if they match.
 *
 * @example
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('2021-01-01 11:00:00', '11:00:00') // true
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('2021-01-01 11:00:00', '11:00') // true
 *
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('2021-01-01', '') // true
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('', '') // true
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('not_a_time', 'invalid_time') // true
 *
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('2021-01-01 11:00:00', '12:00:00') // false
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('2021-01-01', '11:00:00') // false
 *
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('11:00:00', '') // false
 * matchSamplePeriodTimeToWorksheetPeriodDateTime('', '11:00:00') // false
 *
 * @export
 * @param {string} worksheetDateTimeString
 * @param {string} samplingPeriodTimeString
 * @return {*}  {boolean}
 */
export function matchSamplePeriodTimeToWorksheetPeriodDateTime(
  worksheetDateTimeString: string,
  samplingPeriodTimeString: string
): boolean {
  const isWorksheetDateTimeString = isDateTimeString(worksheetDateTimeString);
  const isSamplingPeriodTimeString = isTimeString(samplingPeriodTimeString);

  if (isWorksheetDateTimeString !== isSamplingPeriodTimeString) {
    // If either string contains time information, and the other does not, then they cannot possibly match
    return false;
  }

  if (!isWorksheetDateTimeString && !isSamplingPeriodTimeString) {
    // If neither string contains time information, then they are considered to match
    return true;
  }

  const formattedWorksheetTimeString = dayjs(worksheetDateTimeString).format(DefaultTimeFormat);
  const formattedSamplingPeriodTimeString = dayjs(samplingPeriodTimeString, [
    DefaultTimeFormat,
    DefaultTimeFormatNoSeconds
  ]).format(DefaultTimeFormat);

  if (formattedWorksheetTimeString !== formattedSamplingPeriodTimeString) {
    // Failed to match the time strings
    return false;
  }

  return true;
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
export function matchSamplePeriodsToObservationDateTime(
  observationDate: string | null,
  observationTime: string | null,
  samplingPeriods: SurveySamplePeriodDetails[]
) {
  if (!observationDate) {
    // If no observation date is provided, then no periods can be matched
    return [];
  }

  if (!samplingPeriods.length) {
    // If no sampling periods are provided, then no periods can be matched
    return [];
  }

  const formattedObservationDateTime = observationTime
    ? dayjs(`${observationDate} ${observationTime}`)
    : dayjs(observationDate);

  const suitablePeriods = samplingPeriods.filter((samplingPeriod) => {
    if (!samplingPeriod.start_date || !samplingPeriod.end_date) {
      // If the sampling period does not have a start or end date, then it cannot be matched
      return false;
    }

    const formattedSamplingPeriodStartDateTime = samplingPeriod.start_time
      ? dayjs(`${samplingPeriod.start_date} ${samplingPeriod.start_time}`)
      : dayjs(samplingPeriod.start_date);

    const formattedSamplingPeriodEndDateTime = samplingPeriod.end_time
      ? dayjs(`${samplingPeriod.end_date} ${samplingPeriod.end_time}`)
      : dayjs(samplingPeriod.end_date);

    // The observation date time must be within the start and end date time of the sampling period
    return (
      formattedObservationDateTime.isSameOrAfter(formattedSamplingPeriodStartDateTime) &&
      formattedObservationDateTime.isSameOrBefore(formattedSamplingPeriodEndDateTime)
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
export function formatMatchingPeriod(period: SurveySamplePeriodDetails) {
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
