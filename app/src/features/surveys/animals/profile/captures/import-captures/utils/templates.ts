import { CSVEncodedTemplate, getCSVTemplate } from 'utils/csv-utils';

/**
 * Get CSV template for measurements.
 *
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getMeasurementsCSVTemplate = (): CSVEncodedTemplate => {
  return getCSVTemplate(['ALIAS', 'CAPTURE_DATE', 'CAPTURE_TIME']);
};

/**
 * Get CSV template for captures.
 *
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getCapturesCSVTemplate = (): CSVEncodedTemplate => {
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
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getMarkingsCSVTemplate = (): CSVEncodedTemplate => {
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
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getTelemetryCSVTemplate = (): CSVEncodedTemplate => {
  return getCSVTemplate(['VENDOR', 'SERIAL', 'LATITUDE', 'LONGITUDE', 'DATE', 'TIME']);
};

/**
 * Get CSV template for observations.
 *
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getObservationCSVTemplate = (): CSVEncodedTemplate => {
  return getCSVTemplate(['SPECIES', 'SITE', 'TECHNIQUE', 'PERIOD', 'SIGN', 'COUNT', 'DATE', 'TIME', 'COMMENT']);
};

/**
 * Get CSV template for sample periods.
 *
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getSamplePeriodCSVTemplate = (): CSVEncodedTemplate => {
  return getCSVTemplate(['SAMPLE_SITE', 'TECHNIQUE_NAME', 'START_DATE', 'START_TIME', 'END_DATE', 'END_TIME']);
};

export const getAnimalCSVTemplate = (): CSVEncodedTemplate => {
  return getCSVTemplate(['SPECIES', 'ALIAS', 'SEX', 'WLH_ID', 'DESCRIPTION']);
};
