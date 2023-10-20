import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { safeToLowerCase } from '../../../string-utils';
import { CSVValidator } from '../csv-file';

/**
 * Adds an error for each header that is not unique.
 *
 * Note: This check is case insensitive. In order to avoid confusion, its best not to allow headers with the same
 * spelling and different casing.
 *
 * @return {*}  {CSVValidator}
 */
export const getDuplicateHeadersValidator = (): CSVValidator => {
  return (csvWorksheet) => {
    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      return csvWorksheet;
    }

    const seenHeaders: string[] = [];

    for (const header of headers) {
      if (seenHeaders.includes(safeToLowerCase(header))) {
        // This header was already seen, therefore there is a duplicate header, add an error message
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.DUPLICATE_HEADER,
            message: 'Duplicate Header',
            col: header
          }
        ]);
      } else {
        seenHeaders.push(safeToLowerCase(header));
      }
    }

    return csvWorksheet;
  };
};

export type FileRequiredHeaderValidatorConfig = {
  file_required_columns_validator: {
    name?: string;
    description?: string;
    required_columns: string[];
  };
};

/**
 * For a specified set of required columns, adds an error if the column is not present in the csv.
 *
 * @param {FileRequiredHeaderValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const hasRequiredHeadersValidator = (config?: FileRequiredHeaderValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (!config.file_required_columns_validator.required_columns.length) {
      // No required columns
      return csvWorksheet;
    }

    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    for (const requiredHeader of config.file_required_columns_validator.required_columns) {
      // For each required header, check if there exists a matching header
      if (!headersLowerCase.includes(safeToLowerCase(requiredHeader))) {
        // The array of headers does not include this required header, add an error
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_HEADER,
            message: 'Missing required header',
            col: requiredHeader
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};

export type FileRecommendedHeaderValidatorConfig = {
  file_recommended_columns_validator: {
    name?: string;
    description?: string;
    recommended_columns: string[];
  };
};

/**
 * For a specified set of recommended columns, adds an error if the column is not present in the csv.
 *
 * @param {FileRecommendedHeaderValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const hasRecommendedHeadersValidator = (config?: FileRecommendedHeaderValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (!config.file_recommended_columns_validator.recommended_columns.length) {
      // No recommended columns
      return csvWorksheet;
    }

    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    if (!headersLowerCase?.length) {
      // There are no headers at all, add warnings for all recommended headers
      csvWorksheet.csvValidation.addHeaderWarnings(
        config.file_recommended_columns_validator.recommended_columns.map((recommendedHeader) => {
          return {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER,
            message: 'Missing recommended header',
            col: recommendedHeader
          };
        })
      );

      return csvWorksheet;
    }

    for (const recommendedHeader of config.file_recommended_columns_validator.recommended_columns) {
      // For each recommended header, check if there exists a matching header
      if (!headersLowerCase.includes(safeToLowerCase(recommendedHeader))) {
        // The array of headers does not include this recommended header, add an error
        csvWorksheet.csvValidation.addHeaderWarnings([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_RECOMMENDED_HEADER,
            message: 'Missing recommended header',
            col: recommendedHeader
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};

export type FileValidHeadersValidatorConfig = {
  file_valid_columns_validator: {
    name?: string;
    description?: string;
    valid_columns: string[];
  };
};

/**
 * Adds a error if a column in the csv does not match a value in a specified set of valid columns.
 *
 * @param {FileValidHeadersValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getValidHeadersValidator = (config?: FileValidHeadersValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (!config.file_valid_columns_validator.valid_columns.length) {
      // No valid columns to compare against
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    for (const header of headers) {
      // For each header, check if it exists in the array of valid column headers
      if (!config.file_valid_columns_validator.valid_columns.map(safeToLowerCase).includes(safeToLowerCase(header))) {
        // This header does not exist in the array of valid headers, add an error
        csvWorksheet.csvValidation.addHeaderWarnings([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.UNKNOWN_HEADER,
            message: 'Unsupported header',
            col: header
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};
