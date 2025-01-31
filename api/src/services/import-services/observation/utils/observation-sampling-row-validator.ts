import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DefaultDateFormat, DefaultTimeFormat, DefaultTimeFormatNoSeconds } from '../../../../constants/dates';
import { SurveySamplePeriodDetails } from '../../../../repositories/sample-period-repository';
import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import { CSVRowValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';
import { updateCSVRowState } from '../../../../utils/csv-utils/csv-header-configs';
import { isDateString, isDateTimeString, isTimeString } from '../../../../utils/date-time-utils';
import { ObservationCSVStaticHeader } from '../import-observations-service';

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
 * @param {SurveySamplePeriodDetails[]} samplingPeriods All available sampling periods for the survey.
 * @return {*}  {({ samplePeriodId: number; sampleSiteId: number | null; methodTechniqueId: number | null } | null)} A
 * matching sampling period object, or null if no periods match the row data.
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

      if (matchingPeriodsBySamplingInformation.length === 0) {
        return [
          {
            error: 'Unable to match to observation with sampling information',
            solution: 'Please provide more specific sampling information or observation date and time',
            header: null,
            cell: null
          }
        ];
      }

      if (matchingPeriodsBySamplingInformation.length > 1) {
        return [
          {
            error: 'Unable to uniquely match to observation with sampling information',
            solution: 'Please provide more specific sampling information or observation date and time',
            header: null,
            cell: null
          }
        ];
      }

      // Found exactly one period record that uniquely matches some or all of the filters above, then update the row state
      updateCSVRowState(params.row, {
        sample_period_id: matchingPeriodsBySamplingInformation[0].survey_sample_period_id
      });

      return [];
    }

    // If not site, technique, or period values are provided, then attempt to find a unique period that matches the
    // observation date and time
    const observationDate = utils.getCellValue('DATE', params.row) as string | null;
    const observationTime = utils.getCellValue('TIME', params.row) as string | null;

    const matchingPeriodsByObservationDateTime = matchSamplePeriodsToObservationDateTime(
      observationDate,
      observationTime,
      samplingPeriods
    );

    if (matchingPeriodsByObservationDateTime.length === 0) {
      // Unable to match the observation date/time to any existing period uniquely
      return [
        {
          error: 'Unable to match to observation with date',
          solution: 'Please provide more specific sampling information or a valid observation date and time',
          header: utils.getWorksheetHeader('DATE', params.row),
          cell: observationDate
        },
        {
          error: 'Unable to match to observation with date and time',
          solution: 'Please provide more specific sampling information or a valid observation date and time',
          header: utils.getWorksheetHeader('TIME', params.row),
          cell: observationTime
        }
      ];
    }

    // If at least one period record is found that satisfies the observation date and time, then update row state
    updateCSVRowState(params.row, {
      sample_period_id: matchingPeriodsByObservationDateTime[0].survey_sample_period_id
    });

    return [];
  };
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
  return samplingPeriod.survey_sample_site?.name.toLowerCase() === worksheetSiteName.toLowerCase();
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
  return samplingPeriod.method_technique?.name.toLowerCase() === worksheetTechniqueName.toLowerCase();
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
