import { CSVValidator } from '../csv-file';

/**
 * TODO needs updating to use new config style, etc.
 */
export const getRequiredFieldsValidator = (requiredFieldsByHeader?: string[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!requiredFieldsByHeader?.length) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();

    // If there are no rows, then add errors for all cells in the first data row based on the array of required headers
    if (!rows?.length) {
      csvWorksheet.csvValidation.addRowErrors(
        requiredFieldsByHeader.map((requiredFieldByHeader) => {
          return {
            errorCode: 'Missing Required Field',
            message: `Missing required value for column`,
            col: requiredFieldByHeader,
            row: 2
          };
        })
      );

      return csvWorksheet;
    }

    const headersLowerCase = csvWorksheet.getHeadersLowerCase();

    // If there are rows, then check each cell in each row against the list of required headers, adding errors as needed
    rows.forEach((row, rowIndex) => {
      for (const requiredFieldByHeader of requiredFieldsByHeader) {
        const columnIndex = headersLowerCase.indexOf(requiredFieldByHeader.toLowerCase());

        //if column does not exist, return csvWorksheet
        if (columnIndex < 0) {
          return csvWorksheet;
        }

        const rowValueForColumn = row[columnIndex];

        // Add an error if the cell value is empty
        if (rowValueForColumn === undefined || rowValueForColumn === null || rowValueForColumn === '') {
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: 'Missing Required Field',
              message: `Missing required value for column`,
              col: requiredFieldByHeader,
              row: rowIndex + 2
            }
          ]);
        }
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
      const columnIndex = headersLowerCase.indexOf(config.columnName.toLowerCase());

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
      const allowedCodeValuesLowerCase: string[] = [];
      const allowedCodeValues = config.column_code_validator.allowed_code_values.map((allowedCode) => {
        allowedCodeValuesLowerCase.push(allowedCode.name?.toString().toLowerCase());
        return allowedCode.name;
      });

      // Add an error if the cell value is not one of the elements in the codeValues array
      if (!allowedCodeValuesLowerCase.includes(rowValueForColumn?.toLowerCase())) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: 'Invalid Value',
            message: `Invalid value: ${rowValueForColumn}. Must be one of [${allowedCodeValues.join(', ')}]`,
            col: config.columnName,
            row: rowIndex + 2
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
      const columnIndex = headersLowerCase.indexOf(config.columnName.toLowerCase());

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = Number(row[columnIndex]);

      if (isNaN(rowValueForColumn)) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: 'Invalid Value',
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
              errorCode: 'Out of Range',
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
              errorCode: 'Out of Range',
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
              errorCode: 'Out of Range',
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
      const columnIndex = headersLowerCase.indexOf(config.columnName.toLowerCase());

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
            errorCode: 'Invalid Value',
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
      const columnIndex = headersLowerCase.indexOf(config.columnName.toLowerCase());

      // if column does not exist, return
      if (columnIndex < 0) {
        return csvWorksheet;
      }

      const rowValueForColumn = row[columnIndex];

      if (rowValueForColumn === undefined || rowValueForColumn === null) {
        return csvWorksheet;
      }

      const regex = new RegExp(config.column_format_validator.reg_exp);

      // Add an error if the cell value is not in the correct range provided in the array
      if (!regex.test(rowValueForColumn)) {
        csvWorksheet.csvValidation.addRowErrors([
          {
            errorCode: 'Unexpected Format',
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
