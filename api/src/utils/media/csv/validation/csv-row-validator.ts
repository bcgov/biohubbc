import { SUBMISSION_MESSAGE_TYPE } from '../../../../constants/status';
import { safeToLowerCase } from '../../../string-utils';
import { CSVValidator } from '../csv-file';

export type RequiredFieldsValidatorConfig = {
  columnName: string;
};

/**
 * For a specified column, adds an error for each row whose column value is null, undefined or empty.
 *
 * @param {RequiredFieldsValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getRequiredFieldsValidator = (config?: RequiredFieldsValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    rows.forEach((row, rowIndex) => {
      const columnIndex = headersLowerCase.indexOf(safeToLowerCase(config.columnName));

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = row[columnIndex];

      if (rowValueForColumn == undefined || rowValueForColumn === null || rowValueForColumn === '') {
        // cell is empty when it is required, add an error for this cell
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.MISSING_REQUIRED_FIELD,
            message: `Value is required and cannot be empty`,
            col: config.columnName,
            row: rowIndex + 2
          }
        ]);
      }
    });

    return csvWorksheet;
  };
};

export type ColumnCodeValidatorConfig = {
  columnName: string;
  column_code_validator: {
    name?: string;
    description?: string;
    allowed_code_values: { name: string | number; description?: string }[];
  };
};

/**
 * For a specified column, adds an error for each row whose column value does not match a value in a specified set of
 * allowed values (codes).
 *
 * Note: If the cell is empty, this check will be skipped. Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ColumnCodeValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getCodeValueFieldsValidator = (config?: ColumnCodeValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (!config.column_code_validator.allowed_code_values.length) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    rows.forEach((row, rowIndex) => {
      const columnIndex = headersLowerCase.indexOf(safeToLowerCase(config.columnName));

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = row[columnIndex];
      if (rowValueForColumn === undefined || rowValueForColumn === null || rowValueForColumn === '') {
        // cell is empty, use the getRequiredFieldsValidator to assert required fields
        return csvWorksheet;
      }

      // compare allowed code values as lowercase strings
      const allowedCodeValuesLowerCase: (string | number)[] = [];
      const allowedCodeValues = config.column_code_validator.allowed_code_values.map((allowedCode) => {
        allowedCodeValuesLowerCase.push(safeToLowerCase(String(allowedCode.name)));
        return allowedCode.name;
      });

      // Add an error if the cell value is not one of the elements in the codeValues array
      if (!allowedCodeValuesLowerCase.includes(safeToLowerCase(String(rowValueForColumn)))) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
            message: `Invalid value: ${rowValueForColumn}. Must be one of [${allowedCodeValues.join(', ')}]`,
            col: config.columnName,
            row: rowIndex + 2 // offset the index for a 0 start index and first row in every template being a header row
          }
        ]);
      }
    });

    return csvWorksheet;
  };
};

export type ColumnRangeValidatorConfig = {
  columnName: string;
  column_range_validator: {
    name?: string;
    description?: string;
    min_value?: number;
    max_value?: number;
  };
};

/**
 * For a specified column, adds an error for each row whose column value does not match a specified range.
 *
 * Note: If the cell is empty, this check will be skipped.  Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ColumnRangeValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getValidRangeFieldsValidator = (config?: ColumnRangeValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    rows.forEach((row, rowIndex) => {
      const columnIndex = headersLowerCase.indexOf(safeToLowerCase(config.columnName));

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = Number(row[columnIndex]);

      if (rowValueForColumn === undefined || rowValueForColumn === null) {
        // cell is empty, use the getRequiredFieldsValidator to assert required fields
        return csvWorksheet;
      }

      if (isNaN(rowValueForColumn) && typeof row[columnIndex] === 'string') {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
            message: `Invalid value: ${row[columnIndex]}. Value must be a number `,
            col: config.columnName,
            row: rowIndex + 2
          }
        ]);
      }

      if (config.column_range_validator.min_value && config.column_range_validator.max_value) {
        // Value must be between min value and max value
        if (
          rowValueForColumn < config.column_range_validator.min_value ||
          rowValueForColumn > config.column_range_validator.max_value
        ) {
          // Add an error if the cell value is not in the correct range provided in the array
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
              message: `Invalid value: ${rowValueForColumn}. Value must be between ${config.column_range_validator.min_value} and ${config.column_range_validator.max_value} `,
              col: config.columnName,
              row: rowIndex + 2
            }
          ]);
        }
      } else if (!config.column_range_validator.min_value && config.column_range_validator.max_value) {
        // Value must be less than max value
        if (rowValueForColumn > config.column_range_validator.max_value) {
          // Add an error if the cell value is not in the correct range provided in the array
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
              message: `Invalid value: ${rowValueForColumn}. Value must be less than ${config.column_range_validator.max_value} `,
              col: config.columnName,
              row: rowIndex + 2
            }
          ]);
        }
      } else if (config.column_range_validator.min_value && !config.column_range_validator.max_value) {
        // Value must be greater than min value
        if (rowValueForColumn < config.column_range_validator.min_value) {
          // Add an error if the cell value is not in the correct range provided in the array
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: SUBMISSION_MESSAGE_TYPE.OUT_OF_RANGE,
              message: `Invalid value: ${rowValueForColumn}. Value must be greater than ${config.column_range_validator.min_value} `,
              col: config.columnName,
              row: rowIndex + 2
            }
          ]);
        }
      }
    });

    return csvWorksheet;
  };
};

export type ColumnNumericValidatorConfig = {
  columnName: string;
  column_numeric_validator: {
    name?: string;
    description?: string;
  };
};

/**
 * For a specified column, adds an error for each row whose column value is not numeric.
 *
 * Note: If the cell is empty, this check will be skipped.  Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ColumnNumericValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getNumericFieldsValidator = (config?: ColumnNumericValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    rows.forEach((row, rowIndex) => {
      const columnIndex = headersLowerCase.indexOf(safeToLowerCase(config.columnName));

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      if (row[columnIndex] === undefined || row[columnIndex] === null) {
        return csvWorksheet;
      }

      const rowValueForColumn = Number(row[columnIndex]);

      if (isNaN(rowValueForColumn)) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.INVALID_VALUE,
            message: `Invalid value: ${row[columnIndex]}. Value must be a number `,
            col: config.columnName,
            row: rowIndex + 2
          }
        ]);
      }
    });

    return csvWorksheet;
  };
};

export type ColumnFormatValidatorConfig = {
  columnName: string;
  column_format_validator: {
    name?: string;
    description?: string;
    reg_exp: string;
    reg_exp_flags?: string;
    expected_format: string;
  };
};

/**
 * For a specified column, adds an error for each row whose column value does not match a specified regex format.
 *
 * Note: If the cell is empty, this check will be skipped. Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ColumnFormatValidatorConfig} [config]
 * @return {*}  {CSVValidator}
 */
export const getValidFormatFieldsValidator = (config?: ColumnFormatValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (!config.column_format_validator.reg_exp) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    rows.forEach((row, rowIndex) => {
      const columnIndex = headersLowerCase.indexOf(safeToLowerCase(config.columnName));

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = row[columnIndex];

      if (rowValueForColumn === undefined || rowValueForColumn === null) {
        return csvWorksheet;
      }

      const regexFlags = config.column_format_validator.reg_exp_flags ?? '';

      const regex = new RegExp(config.column_format_validator.reg_exp, regexFlags);

      // Add an error if the cell value is not in the correct range provided in the array
      if (!regex.test(rowValueForColumn)) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.UNEXPECTED_FORMAT,
            message: `Unexpected Format: ${rowValueForColumn}. ${config.column_format_validator.expected_format}`,
            col: config.columnName,
            row: rowIndex + 2
          }
        ]);
      }
    });

    return csvWorksheet;
  };
};

export type FileColumnUniqueValidatorConfig = {
  file_column_unique_validator: {
    column_names: string[];
  };
};

export const getUniqueColumnsValidator = (config?: FileColumnUniqueValidatorConfig): CSVValidator => {
  return (csvWorksheet) => {
    if (!config) {
      return csvWorksheet;
    }

    if (config.file_column_unique_validator.column_names.length < 1) {
      return csvWorksheet;
    }

    const keySet = new Set();
    const rows = csvWorksheet.getRowObjects();
    const lowercaseHeaders = csvWorksheet.getHeadersLowerCase();

    // find the indices of all provided column names in the worksheet
    const columnIndices = config.file_column_unique_validator.column_names.map((column) =>
      lowercaseHeaders.indexOf(safeToLowerCase(column))
    );

    // checks list of column indices if any are missing (-1) and returns early
    if (columnIndices.includes(-1)) {
      return csvWorksheet;
    }

    rows.forEach((row, rowIndex) => {
      const key = config.file_column_unique_validator.column_names
        .map((columnIndex) => `${row[columnIndex] || ''}`.trim().toLowerCase())
        .join(', ');
      // check if key exists already
      if (!keySet.has(key)) {
        keySet.add(key);
      } else {
        // duplicate key found
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: SUBMISSION_MESSAGE_TYPE.NON_UNIQUE_KEY,
            message: `Row ${
              rowIndex + 2
            } has duplicate values (${key}) to another row.  The combination of values in columns: ${config.file_column_unique_validator.column_names.join(
              ', '
            )} must be unique across rows.  Details: `,
            col: key,
            row: rowIndex + 2
          }
        ]);
      }
    });
    return csvWorksheet;
  };
};
