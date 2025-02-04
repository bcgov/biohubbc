import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DefaultTimeFormat, DefaultTimeFormatNoSeconds } from '../../../../constants/dates';
import { SurveySamplePeriodDetails } from '../../../../repositories/sample-period-repository';
import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import { CSVRowValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../../utils/csv-utils/csv-header-configs';
import { formatDateString, isDateString, isDateTimeString, isTimeString } from '../../../../utils/date-time-utils';
import { ObservationCSVStaticHeader } from '../import-observations-service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Observation Sampling Information Row Validator - This function will validate a row of observation data and ensure
 * that the sampling information provided in the row matches a valid sampling period from the provided list of
 * sampling periods.
 *
 * Successfull paths:
 *  1. No sampling information provided, but observation date / time is provided (no period needed)
 *  2. Exact period match found using site, technique, and period
 *  3. Multiple periods match the site, technique, and period, but only one matches the observation date and time
 *
 * @param {SurveySamplePeriodDetails[]} samplingPeriods All available sampling periods for the survey.
 * @param {CSVConfigUtils<ObservationCSVStaticHeader>} utils CSV Config Utils for the observation CSV.
 * @return {*} {CSVRowValidator}
 */
export function getObservationSamplingInformationRowValidator(
  samplingPeriods: SurveySamplePeriodDetails[],
  utils: CSVConfigUtils<ObservationCSVStaticHeader>
): CSVRowValidator {
  return (params) => {
    // Extract site, technique, and period data from the row
    const worksheetSiteName = utils.getCellValue('SAMPLING_SITE', params.row) as string | null;
    const worksheetTechniqueName = utils.getCellValue('METHOD_TECHNIQUE', params.row) as string | null;
    const worksheetPeriod = utils.getCellValue('SAMPLING_PERIOD', params.row) as string | null;

    // Extract observation date and time from the row
    const worksheetObservationDate = utils.getCellValue('DATE', params.row) as string | null;
    const worksheetObservationTime = utils.getCellValue('TIME', params.row) as string | null;

    // Determine if the worksheet contains any sampling information
    const worksheetHasSamplingInformation = worksheetSiteName || worksheetTechniqueName || worksheetPeriod;

    // VALID: No sampling information provided, but observation date / time is provided (no period needed)
    if (!worksheetHasSamplingInformation && worksheetObservationDate) {
      return [];
    }

    // INVALID: No sampling information or observation date / time provided
    if (!worksheetHasSamplingInformation && !worksheetObservationDate) {
      return [
        {
          error: 'Row does not contain sampling information or observation date / time',
          solution: 'Please provide sampling information or a valid observation date and time',
          header: null,
          cell: null
        }
      ];
    }

    // Filter the sampling periods by the provided sampling information
    //
    // Rules:
    //  0: No matching periods found for site, technique, and period (ERROR)
    //  1: Exact period match found using site, technique, and period (SUCCESS)
    //  >1: Multiple periods match the site, technique, and period (Filter by observation date/time)
    const matchingPeriodsBySamplingInformation = findMatchingPeriodsWithSamplingInformation(samplingPeriods, {
      siteName: worksheetSiteName,
      techniqueName: worksheetTechniqueName,
      period: worksheetPeriod
    });

    // INVALID: No matching periods found for site, technique, and period
    if (matchingPeriodsBySamplingInformation.length === 0) {
      return [
        {
          error: 'Unable to match observation with sampling information',
          solution: 'Please provide more specific sampling information (site, technique, period)',
          header: null,
          cell: null
        }
      ];
    }

    // VALID: Exact period match found using site, technique, and period
    if (matchingPeriodsBySamplingInformation.length === 1) {
      updateCSVRowState(params.row, {
        sample_period_id: matchingPeriodsBySamplingInformation[0].survey_sample_period_id
      });

      return [];
    }

    // Filter the matching periods by the observation date and time
    //
    // Rules:
    //  0 Matches: No matching periods found for observation date/time (ERROR)
    //  1 Match: Exact period match found using observation date and time (SUCCESS)
    //  >1 Match: Multiple periods match the observation date and time (ERROR)
    const matchingPeriodsByObservationDateTime = findMatchingPeriodsWithObservationDateTime(
      worksheetObservationDate,
      worksheetObservationTime,
      matchingPeriodsBySamplingInformation
    );

    // INVALID: Unable to match the observation date/time to any existing period uniquely
    if (matchingPeriodsByObservationDateTime.length === 0) {
      return [
        {
          error: 'Sampling period is ambiguous, unable to uniquely identify period using observation date',
          solution:
            'Use an observation date that falls within a single period start and end date, or explicitly add a period',
          header: utils.getWorksheetHeader('DATE', params.row),
          cell: worksheetObservationDate
        },
        {
          error: 'Sampling period is ambiguous, unable to unquely identify period using observation date and time',
          solution:
            'Use an observation date and time that falls within a single period start and end date, or explicitly add a period',
          header: utils.getWorksheetHeader('TIME', params.row),
          cell: worksheetObservationTime
        }
      ];
    }

    // VALID: Exact period match found using sampling information and observation date and time
    if (matchingPeriodsByObservationDateTime.length === 1) {
      updateCSVRowState(params.row, {
        sample_period_id: matchingPeriodsByObservationDateTime[0].survey_sample_period_id
      });

      return [];
    }

    // INVALID: Multiple periods match the observation date and time
    return [
      {
        error: 'More than one period matches the observation date and time',
        solution: 'Use a observation date and time that falls within the period start and end date of a single period',
        header: utils.getWorksheetHeader('DATE', params.row),
        cell: worksheetObservationDate
      },
      {
        error: 'More than one period matches the observation date and time',
        solution: 'Use a observation date and time that falls within the period start and end date of a single period',
        header: utils.getWorksheetHeader('TIME', params.row),
        cell: worksheetObservationTime
      }
    ];
  };
}

/**
 * Find Matching Periods with Sampling Information - This function will filter a list of sampling periods by the provided
 * sampling information. It will return all periods that match the provided site, technique, and period.
 *
 * @param {SurveySamplePeriodDetails[]} samplingPeriods All available sampling periods for the survey.
 * @param {{ siteName: string | null; techniqueName: string | null; period: string | null; }} samplingInformation
 * @return {*} {SurveySamplePeriodDetails[]}
 */
export function findMatchingPeriodsWithSamplingInformation(
  samplingPeriods: SurveySamplePeriodDetails[],
  samplingInformation: {
    siteName: string | null;
    techniqueName: string | null;
    period: string | null;
  }
): SurveySamplePeriodDetails[] {
  // Find all periods that match the provided site, technique, and period
  // Periods must match all non-null worksheet values to be considered a match
  return samplingPeriods.filter((period) => {
    if (samplingInformation.siteName) {
      const isMatch = matchSamplePeriodToWorksheetSiteName(samplingInformation.siteName, period);

      if (!isMatch) {
        // If the worksheet site name is provided but does not match, then this period is not a match
        return false;
      }
    }

    if (samplingInformation.techniqueName) {
      const isMatch = matchSamplePeriodToWorksheetTechniqueName(samplingInformation.techniqueName, period);

      if (!isMatch) {
        // If the worksheet technique name is provided but does not match, then this period is not a match
        return false;
      }
    }

    if (samplingInformation.period) {
      const isMatch = matchSamplePeriodToWorksheetPeriod(samplingInformation.period, period);

      if (!isMatch) {
        // If the worksheet period is provided but does not match, then this period is not a match
        return false;
      }
    }

    // If all provided (non-null) values match, then consider this period a match
    return true;
  });
}

/**
 * Match Sample Period to Worksheet Site Name - This function will compare a worksheet site name to a sampling site object
 * and return true if the names match.
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
  return samplingPeriod.survey_sample_site?.name.toLowerCase() === worksheetSiteName.toLowerCase();
}

/**
 * Match Sample Period to Worksheet Technique Name - This function will compare a worksheet technique name to a sampling
 * technique object and return true if the names match.
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
  return samplingPeriod.method_technique?.name.toLowerCase() === worksheetTechniqueName.toLowerCase();
}

/**
 * Match Sample Period to Worksheet Period - This function will compare a worksheet period string to a sampling period
 * object and return true if they match.
 *
 * It will compare a worksheet period string to a sampling period object and return true if they match.
 *
 * They must match on start_date and end_date. And optionally match on start_time and end_time if they are present
 * in the worksheet period string.
 *
 * Note: This function relies on the incoming period string to separate the start and end dates with a " - " delimiter.
 *
 * @param {string} worksheetPeriod A string in the format "YYYY-MM-DDTHH:mm:ss - YYYY-MM-DDTHH:mm:ss", or a valid subset or
 * superset. (Ex: "2024-07-28 - 2024-07-29", "2024-07-28T00:00:00 - 2024-07-29T23:59:59", etc)
 * @param {SurveySamplePeriodDetails[]} samplingPeriod
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

  const formattedWorksheetDateString = formatDateString(worksheetDateTimeString);
  const formattedSamplingPeriodDateString = formatDateString(samplingPeriodDateString);

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
 * Find Matching Periods with Observation Date Time - This function will take an observation date and time and find all
 * matching sampling periods from the provided samplingPeriods.
 *
 * @param {(string | null)} observationDate
 * @param {(string | null)} observationTime
 * @param {SurveySamplePeriodDetails[]} samplingPeriods
 * @return {*}
 */
export function findMatchingPeriodsWithObservationDateTime(
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
