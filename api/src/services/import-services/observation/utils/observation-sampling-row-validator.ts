import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import lodash from 'lodash';
const { compact } = lodash;

import { DefaultTimeFormat, DefaultTimeFormatNoSeconds } from '../../../../constants/dates';
import { ApiGeneralError } from '../../../../errors/api-error';
import { SurveySamplePeriodDetails } from '../../../../repositories/sample-period-repository';
import { SampleSiteRecordExtendedNonSpatial } from '../../../../repositories/sample-site-repository/sample-site-repository';
import { TechniqueObject } from '../../../../repositories/technique-repository';
import { CaseInsensitiveMap } from '../../../../utils/case-insensitive-map';
import { CSVConfigUtils } from '../../../../utils/csv-utils/csv-config-utils';
import {
  CSVRowError,
  CSVRowParams,
  CSVRowValidator
} from '../../../../utils/csv-utils/csv-config-validation.interface';
import {
  formatDateString,
  isDateString,
  isDateTimeString,
  isTimeString,
  newDayjs
} from '../../../../utils/date-time-utils';
import { updateCSVRowState } from '../../utils/row-state';
import { ObservationCSVStaticHeader } from '../import-observations-service';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface IRowValidatorParams {
  /**
   * All available sampling periods for the survey.
   *
   * @type {SurveySamplePeriodDetails[]}
   */
  samplePeriods: SurveySamplePeriodDetails[];
  /**
   * All available sample sites for the survey.
   *
   * @type {SampleSiteRecordExtendedNonSpatial[]}
   */
  sampleSites: SampleSiteRecordExtendedNonSpatial[];
  /**
   * All available method techniques for the survey.
   *
   * @type {TechniqueObject[]}
   */
  methodTechniques: TechniqueObject[];
  /**
   * CSV Config Utils for the observation CSV.
   *
   * @type {CSVConfigUtils<ObservationCSVStaticHeader>}
   */
  utils: CSVConfigUtils<ObservationCSVStaticHeader>;
  /**
   * Optional sample period id to automatically associate the observation row with.
   *
   * @type {number | undefined}
   */
  samplePeriodId?: number;
}

/**
 * Observation Sampling Information Row Validator - This function will validate a row of observation data and ensure
 * that the sampling information provided in the row matches a valid sampling period from the provided list of
 * sampling periods.
 *
 *
 * Successfull paths:
 *  1. No sampling information provided, but observation date, latitude and longitude is provided
 *  2. Exact period match found using site, technique, and period
 *  3. Multiple periods match the site, technique, and period, but only one matches the observation date and time
 *
 * @param {IRowValidatorParams} rowValidatorParams
 * @return {*} {CSVRowValidator}
 */
export function getObservationSamplingInformationRowValidator(
  rowValidatorParams: IRowValidatorParams
): CSVRowValidator {
  const { samplePeriods, methodTechniques, sampleSites, utils, samplePeriodId } = rowValidatorParams;

  // Generate case-insensitive maps for the method techniques and sample sites
  const methodTechniqueMap = new CaseInsensitiveMap(
    methodTechniques.map((technique) => [technique.name, technique.method_technique_id])
  );
  const sampleSiteMap = new CaseInsensitiveMap(sampleSites.map((site) => [site.name, site.survey_sample_site_id]));

  return (params) => {
    // Extract site, technique, and period data from the row
    const worksheetSiteName = utils.getCellValue('SAMPLE_SITE', params.row) as string | null;
    const worksheetTechniqueName = utils.getCellValue('METHOD_TECHNIQUE', params.row) as string | null;
    const worksheetPeriod = utils.getCellValue('SAMPLE_PERIOD', params.row) as string | null;

    // Extract observation date and time from the row
    const worksheetObservationDate = utils.getCellValue('DATE', params.row) as string | null;
    const worksheetObservationTime = utils.getCellValue('TIME', params.row) as string | null;

    // Extract latitude and longitude from the row
    const worksheetLatitude = utils.getCellValue('LATITUDE', params.row) as string | null;
    const worksheetLongitude = utils.getCellValue('LONGITUDE', params.row) as string | null;

    // Determine if the worksheet contains any sampling information
    const worksheetHasSamplingInformation = Boolean(worksheetSiteName || worksheetTechniqueName || worksheetPeriod);

    // VALID: Sample period id is provided and exists in the list of sampling periods
    if (samplePeriodId) {
      if (findMatchingPeriodWithSamplePeriodId(samplePeriods, samplePeriodId)) {
        updateCSVRowState(params.row, { sample_period_id: samplePeriodId });

        return [];
      }

      // Note: Normally we don't want to throw errors in validators, but in this case, it's a critical error
      // that should be caught early in the import process.
      // Why? The sample period id is provided by the caller and must match to a sample period
      // in the list of survey sample periods. Realistically this error will only be triggered by
      // developers (who provide an incorrect `samplePeriodId`) and not end-users.
      throw new ApiGeneralError('Invalid sample period id provided', [
        'observation-sampling-row-validator->getObservationSamplingInformationRowValidator',
        { survey_sample_period_id: samplePeriodId }
      ]);
    }

    // VALID: No sampling information provided, but observation date / time is provided with lat / lon
    if (!worksheetHasSamplingInformation && worksheetObservationDate && worksheetLatitude && worksheetLongitude) {
      return [];
    }

    // Validate the observation date, latitude, and longitude exist when sampling information is NOT provided
    if (!worksheetHasSamplingInformation) {
      const errors = validateWorksheetHasLatitudeLongitudeAndDate(
        worksheetObservationDate,
        worksheetLatitude,
        worksheetLongitude,
        utils,
        params
      );

      // INVALID: Observation date, latitude, and longitude must all be provided when sampling information is NOT provided
      if (errors.length) {
        return errors;
      }
    }

    // Validate the site and technique names exist in the sample periods
    const siteNameDoesNotExistError = validateSiteExistsInSurveySampleSiteMap(
      worksheetSiteName,
      utils.getWorksheetHeader('SAMPLE_SITE', params.row),
      sampleSiteMap
    );

    const techniqueNameDoesNotExistError = validateTechniqueExistsInSurveyTechniqueMap(
      worksheetTechniqueName,
      utils.getWorksheetHeader('METHOD_TECHNIQUE', params.row),
      methodTechniqueMap
    );

    // Combine the site and technique errors and remove any null values
    const siteAndTechniqueErrors = compact([siteNameDoesNotExistError, techniqueNameDoesNotExistError]);

    // INVALID: Site or technique name does not exist in the survey reference data (method techniques and sample sites)
    if (siteAndTechniqueErrors.length) {
      return siteAndTechniqueErrors;
    }

    // Filter the sampling periods by the provided sampling information
    //
    // Rules:
    //  0: No matching periods found for site, technique, and period (ERROR)
    //  1: Exact period match found using site, technique, and period (SUCCESS)
    //  >1: Multiple periods match the site, technique, and period (Filter by observation date/time)
    const matchingPeriodsBySamplingInformation = findMatchingPeriodsWithSamplingInformation(samplePeriods, {
      siteName: worksheetSiteName,
      techniqueName: worksheetTechniqueName,
      period: worksheetPeriod
    });

    // INVALID: No matching periods found for site, technique, and period
    if (matchingPeriodsBySamplingInformation.length === 0) {
      return [
        {
          error: 'Unable to find matching sampling period',
          solution: `Make sure you have a period for site '${worksheetSiteName}' and technique '${worksheetTechniqueName}', and create one if you don't.`,
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
    return validateSinglePeriodMatchesWithObservationDateTime(
      worksheetObservationDate,
      worksheetObservationTime,
      matchingPeriodsBySamplingInformation,
      utils,
      params
    );
  };
}

export const observationSamplingRowValidatorDependencies = {
  getObservationSamplingInformationRowValidator
};

/**
 * Validate Observation Date, Latitude, and Longitude all exist - used when sampling information is not provided.
 *
 * @param {string | null} worksheetObservationDate The observation date from the worksheet
 * @param {string | null} worksheetLatitude The latitude from the worksheet
 * @param {string | null} worksheetLongitude The longitude from the worksheet
 * @param {CSVConfigUtils<ObservationCSVStaticHeader>} utils The CSV Config Utils for the observation CSV
 * @param {CSVRowParams} params The CSV Row Params
 * @return {*} {CSVRowError[]} A list of CSV row errors
 */
export function validateWorksheetHasLatitudeLongitudeAndDate(
  worksheetObservationDate: string | null,
  worksheetLatitude: string | null,
  worksheetLongitude: string | null,
  utils: CSVConfigUtils<ObservationCSVStaticHeader>,
  params: CSVRowParams
) {
  const errors: CSVRowError[] = [];

  // INVALID: Observation date is required when sampling information is not provided
  if (!worksheetObservationDate) {
    errors.push({
      error: 'Observation date is required when sampling information is not provided',
      solution: 'Please provide sampling information or an observation date and time',
      header: utils.getWorksheetHeader('DATE', params.row),
      cell: null
    });
  }

  // INVALID: Latitude is required when sampling information is not provided
  if (!worksheetLatitude) {
    errors.push({
      error: 'Latitude is required when sampling information is not provided',
      solution: 'Please provide sampling information or a valid latitude',
      header: utils.getWorksheetHeader('LATITUDE', params.row),
      cell: null
    });
  }

  // INVALID: Longitude is required when sampling information is not provided
  if (!worksheetLongitude) {
    errors.push({
      error: 'Longitude is required when sampling information is not provided',
      solution: 'Please provide sampling information or a valid longitude',
      header: utils.getWorksheetHeader('LONGITUDE', params.row),
      cell: null
    });
  }

  return errors;
}

/**
 * Validate Single Period Matches with Observation Date Time - This function will validate a list of sampling periods
 * (filtered by site, technique, and period) and ensure that the observation date and time provided in the row matches
 * a valid sampling period from the list of sampling periods.
 *
 * @param {string | null} worksheetObservationDate The observation date from the worksheet
 * @param {string | null} worksheetObservationTime The observation time from the worksheet
 * @param {SurveySamplePeriodDetails[]} samplePeriods The list of sampling periods to validate against
 * @param {CSVConfigUtils<ObservationCSVStaticHeader>} utils The CSV Config Utils for the observation CSV
 * @param {CSVRowParams} params The CSV Row Params
 * @return {*} {CSVRowError[]} A list of CSV row errors
 */
export function validateSinglePeriodMatchesWithObservationDateTime(
  worksheetObservationDate: string | null,
  worksheetObservationTime: string | null,
  samplePeriods: SurveySamplePeriodDetails[],
  utils: CSVConfigUtils<ObservationCSVStaticHeader>,
  params: CSVRowParams
) {
  const matchingPeriodsByObservationDateTime = findMatchingPeriodsWithObservationDateTime(
    worksheetObservationDate,
    worksheetObservationTime,
    samplePeriods
  );

  // VALID: Exact period match found using sampling information and observation date and time
  if (matchingPeriodsByObservationDateTime.length === 1) {
    updateCSVRowState(params.row, {
      sample_period_id: matchingPeriodsByObservationDateTime[0].survey_sample_period_id
    });

    return [];
  }

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
}

/**
 * Validate the sample site name exists in the sample site map
 *
 * @param {string | null} siteName The site name to validate
 * @param {Uppercase<string> | null} header The header of the site name cell
 * @param {CaseInsensitiveMap<string, number>} sampleSiteMap All case-insensitive sample site names mapped to their ids
 * @return {*} {CSVError | null}
 */
export function validateSiteExistsInSurveySampleSiteMap(
  siteName: string | null,
  header: Uppercase<string> | null,
  sampleSiteMap: CaseInsensitiveMap<string, number>
): CSVRowError | null {
  // If no site name is provided, then no validation is required
  if (!siteName) {
    return null;
  }

  const sampleSite = sampleSiteMap.get(siteName);

  if (!sampleSite) {
    return {
      error: 'Site does not exist',
      solution: `Use the name of an existing sampling site, or create the site if it doesn't exist`,
      header: header,
      cell: siteName,
      values: Array.from(sampleSiteMap.keys())
    };
  }

  return null;
}

/**
 * Validate the method technique name exists in the the method techniques map
 *
 * @param {string | null} techniqueName The technique name to validate
 * @param {Uppercase<string> | null} header The header of the technique name cell
 * @param {CaseInsensitiveMap<string, number>} methodTechniqueMap All case-insensitive sample technique names mapped to their ids
 * @return {*} {CSVError | null}
 */
export function validateTechniqueExistsInSurveyTechniqueMap(
  techniqueName: string | null,
  header: Uppercase<string> | null,
  methodTechniqueMap: CaseInsensitiveMap<string, number>
): CSVRowError | null {
  // If no technique name is provided, then no validation is required
  if (!techniqueName) {
    return null;
  }

  const methodTechnique = methodTechniqueMap.get(techniqueName);

  if (!methodTechnique) {
    return {
      error: 'Technique does not exist',
      solution: `Use the name of an existing technique, or create the technique if it doesn't exist`,
      header: header,
      cell: techniqueName,
      values: Array.from(methodTechniqueMap.keys())
    };
  }

  return null;
}

/**
 * Match Sample Period to Worksheet Site Name - This function will compare a worksheet site name to a sampling site object
 * and return true if the names match.
 *
 * It will compare a worksheet site name to a sampling site object and return true if the names match.
 *
 * @param {string} worksheetSiteName
 * @param {SurveySamplePeriodDetails} samplePeriod
 * @return {*}  {boolean}
 */
export function matchSamplePeriodToWorksheetSiteName(
  worksheetSiteName: string,
  samplePeriod: SurveySamplePeriodDetails
): boolean {
  return samplePeriod.survey_sample_site?.name.toLowerCase() === worksheetSiteName.toLowerCase();
}

/**
 * Match Sample Period to Worksheet Technique Name - This function will compare a worksheet technique name to a sampling
 * technique object and return true if the names match.
 *
 * It will compare a worksheet technique name to a sampling technique object and return true if the names match.
 *
 * @param {string} worksheetTechniqueName
 * @param {SurveySamplePeriodDetails} samplePeriod
 * @return {*}  {boolean}
 */
export function matchSamplePeriodToWorksheetTechniqueName(
  worksheetTechniqueName: string,
  samplePeriod: SurveySamplePeriodDetails
): boolean {
  return samplePeriod.method_technique?.name.toLowerCase() === worksheetTechniqueName.toLowerCase();
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
 * @param {SurveySamplePeriodDetails} samplePeriod
 * @return {*}  {SurveySamplePeriodDetails}
 */
export function matchSamplePeriodToWorksheetPeriod(
  worksheetPeriod: string,
  samplePeriod: SurveySamplePeriodDetails
): boolean {
  const [worksheetStartDateTime, worksheetEndDateTime] = worksheetPeriod.split(' - ');

  if (!worksheetStartDateTime || !worksheetEndDateTime) {
    // Failed to split the period string into expected start and end date strings
    return false;
  }

  if (!matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetStartDateTime, samplePeriod.start_date ?? '')) {
    // Failed to match the period start date
    return false;
  }

  if (!matchSamplePeriodDateToWorksheetPeriodDateTime(worksheetEndDateTime, samplePeriod.end_date ?? '')) {
    // Failed to match the period end date
    return false;
  }

  // If the start time is included in the timestamp string, then it must match the start time of the period
  if (
    isDateTimeString(worksheetStartDateTime) &&
    !matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetStartDateTime, samplePeriod.start_time ?? '')
  ) {
    // Failed to match the period start time
    return false;
  }

  // If the end time is included in the timestamp string, then it must match the end time of the period
  if (
    isDateTimeString(worksheetEndDateTime) &&
    !matchSamplePeriodTimeToWorksheetPeriodDateTime(worksheetEndDateTime, samplePeriod.end_time ?? '')
  ) {
    // Failed to match the period end time
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
 * Find Matching Period with Sample Period Id - This function will return true if the provided sample period id is found
 * in the provided list of sample periods.
 *
 * @param {SurveySamplePeriodDetails[]} samplePeriods
 * @param {number} samplePeriodId
 * @return {*} {boolean}
 */
export function findMatchingPeriodWithSamplePeriodId(
  samplePeriods: SurveySamplePeriodDetails[],
  samplePeriodId: number
): boolean {
  return samplePeriods.some((period) => period.survey_sample_period_id === samplePeriodId);
}

/**
 * Find Matching Periods with Sampling Information - This function will filter a list of sampling periods by the provided
 * sampling information. It will return all periods that match the provided site, technique, and period.
 *
 * @param {SurveySamplePeriodDetails[]} samplePeriods All available sampling periods for the survey.
 * @param {{ siteName: string | null; techniqueName: string | null; period: string | null; }} samplingInformation
 * @return {*} {SurveySamplePeriodDetails[]}
 */
export function findMatchingPeriodsWithSamplingInformation(
  samplePeriods: SurveySamplePeriodDetails[],
  samplingInformation: {
    siteName: string | null;
    techniqueName: string | null;
    period: string | null;
  }
): SurveySamplePeriodDetails[] {
  // Find all periods that match the provided site, technique, and period
  // Periods must match all non-null worksheet values to be considered a match
  return samplePeriods.filter((period) => {
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
 * Find Matching Periods with Observation Date Time - This function will take an observation date and time and find all
 * matching sampling periods from the provided samplePeriods.
 *
 * @param {(string | null)} observationDate
 * @param {(string | null)} observationTime
 * @param {SurveySamplePeriodDetails[]} samplePeriods
 * @return {*}
 */
export function findMatchingPeriodsWithObservationDateTime(
  observationDate: string | null,
  observationTime: string | null,
  samplePeriods: SurveySamplePeriodDetails[]
) {
  if (!observationDate) {
    // If no observation date is provided, then no periods can be matched
    return [];
  }

  if (!samplePeriods.length) {
    // If no sampling periods are provided, then no periods can be matched
    return [];
  }

  const observationDateTime = newDayjs(observationDate, observationTime);

  const matchingObservationSamplePeriods = samplePeriods.filter((samplePeriod) => {
    if (!samplePeriod.start_date || !samplePeriod.end_date) {
      // If the sampling period does not have a start or end date, then it cannot be matched
      return false;
    }

    const samplePeriodStartDateTime = newDayjs(samplePeriod.start_date, samplePeriod.start_time);
    const samplePeriodEndDateTime = newDayjs(samplePeriod.end_date, samplePeriod.end_time);

    // The observation date time must be within the start and end date time of the sampling period
    return (
      observationDateTime.isSameOrAfter(samplePeriodStartDateTime) &&
      observationDateTime.isSameOrBefore(samplePeriodEndDateTime)
    );
  });

  return matchingObservationSamplePeriods;
}
