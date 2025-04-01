const CSV_VALIDATION_ERROR = 'CSV Validation Error';

export interface CSVError {
  error: string;
  solution: string;
  header: string | null;
  cell: string | number | null;
  values: Array<string | number> | null;
  row: number;
}

export interface CSVValidationError {
  name: typeof CSV_VALIDATION_ERROR;
  message: string;
  status: number;
  errors: CSVError[];
}

// Encoded CSV template string
export type CSVEncodedTemplate = `data:text/csv;charset=utf-8,${string}\n`;

/**
 * Get CSV template from a list of column headers.
 *
 * @param {string[]} headers - CSV column headers
 * @returns {CSVEncodedTemplate} Encoded CSV template
 */
export const getCSVTemplate = (headers: string[]): CSVEncodedTemplate => {
  const template: CSVEncodedTemplate = `data:text/csv;charset=utf-8,${headers.join(',')}\n`;
  return template;
};

/**
 * Check if the error is a CSV validation error.
 *
 * @param {any} error - The error object to check
 * @returns {boolean} True if the error is a CSV validation error
 */
export const isCSVValidationError = (error: any): error is CSVValidationError => {
  return error && error.name === CSV_VALIDATION_ERROR && error.status === 422;
};
