import { getCSVTemplate } from 'utils/file-utils';

/**
 * Get CSV template for measurements.
 *
 * @returns {string} Encoded CSV template
 */
export const getMeasurementsCSVTemplate = (): string => {
  return getCSVTemplate(['ALIAS', 'CAPTURE_DATE', 'CAPTURE_TIME']);
};

/**
 * Get CSV template for captures.
 *
 * @returns {string} Encoded CSV template
 */
export const getCapturesCSVTemplate = (): string => {
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
 * @returns {string} Encoded CSV template
 */
export const getMarkingsCSVTemplate = (): string => {
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
