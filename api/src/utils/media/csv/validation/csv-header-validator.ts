import { CSVValidator } from '../csv-file';

/**
 * Adds an error for each header that is not unique.
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
      if (seenHeaders.includes(header)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            errorCode: 'Duplicate Header',
            message: 'Duplicate header',
            col: header
          }
        ]);
      } else {
        seenHeaders.push(header);
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

    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      csvWorksheet.csvValidation.addHeaderErrors(
        config.file_required_columns_validator.required_columns.map((requiredHeader) => {
          return {
            errorCode: 'Missing Required Header',
            message: 'Missing required header',
            col: requiredHeader
          };
        })
      );

      return csvWorksheet;
    }

    for (const requiredHeader of config.file_required_columns_validator.required_columns) {
      if (!headers.includes(requiredHeader)) {
        csvWorksheet.csvValidation.addHeaderErrors([
          {
            errorCode: 'Missing Required Header',
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
 * For a specified set of recommended columns, adds a warning if the column is not present in the csv.
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
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    if (!headers?.length) {
      csvWorksheet.csvValidation.addHeaderWarnings(
        config.file_recommended_columns_validator.recommended_columns.map((recommendedHeader) => {
          return {
            errorCode: 'Missing Recommended Header',
            message: 'Missing recommended header',
            col: recommendedHeader
          };
        })
      );

      return csvWorksheet;
    }

    for (const recommendedHeader of config.file_recommended_columns_validator.recommended_columns) {
      if (!headers.includes(recommendedHeader)) {
        csvWorksheet.csvValidation.addHeaderWarnings([
          {
            errorCode: 'Missing Recommended Header',
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
 * Adds a warning if a column in the csv does not match a value in a specified set of valid columns.
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
      return csvWorksheet;
    }

    const headers = csvWorksheet.getHeaders();

    for (const header of headers) {
      if (!config.file_valid_columns_validator.valid_columns.includes(header)) {
        csvWorksheet.csvValidation.addHeaderWarnings([
          {
            errorCode: 'Unknown Header',
            message: 'Unsupported header',
            col: header
          }
        ]);
      }
    }

    return csvWorksheet;
  };
};
