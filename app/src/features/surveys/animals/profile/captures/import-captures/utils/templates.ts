import { CSVTemplateString, getCSVTemplate } from 'utils/csv-utils';

/**
 * Get CSV template for measurements.
 *
 * @returns {CSVTemplateString} Encoded CSV template
 */
export const getMeasurementsCSVTemplate = (): CSVTemplateString => {
  return getCSVTemplate(['ALIAS', 'CAPTURE_DATE', 'CAPTURE_TIME']);
};

/**
 * Get CSV template for captures.
 *
 * @returns {CSVTemplateString} Encoded CSV template
 */
export const getCapturesCSVTemplate = (): CSVTemplateString => {
  return getCSVTemplate([
    'ALIAS',
    'CAPTURE_DATE',
    'CAPTURE_TIME',
    'CAPTURE_LATITUDE',
    'CAPTURE_LONGITUDE',
    'RELEASE_DATE',
    'RELEASE_TIME',
    'RELEASE_LATITUDE',
    'RELEASE_LONGITUDE',
    'RELEASE_COMMENT',
    'CAPTURE_COMMENT'
  ]);
};

/**
 * Get CSV template for markings.
 *
 * @returns {CSVTemplateString} Encoded CSV template
 */
export const getMarkingsCSVTemplate = (): CSVTemplateString => {
  return getCSVTemplate([
    'ALIAS',
    'CAPTURE_DATE',
    'CAPTURE_TIME',
    'BODY_LOCATION',
    'MARKING_TYPE',
    'IDENTIFIER',
    'PRIMARY_COLOUR',
    'SECONDARY_COLOUR',
    'COMMENT'
  ]);
};

/**
 * Get CSV template for telemetry.
 *
 * @returns {CSVTemplateString} Encoded CSV template
 */
export const getTelemetryCSVTemplate = (): CSVTemplateString => {
  return getCSVTemplate(['VENDOR', 'SERIAL', 'LATITUDE', 'LONGITUDE', 'DATE', 'TIME']);
};
