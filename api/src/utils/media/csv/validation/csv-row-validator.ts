import { CSVValidator } from '../csv-file';

/**
 * For each header in `requiredFieldsByHeader`, adds an error for each row cell that is empty.
 *
 * @param {string[]} [requiredFieldsByHeader]
 * @return {*}  {CSVValidator}
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

    const headers = csvWorksheet.getHeaders();

    // If there are rows, then check each cell in each row against the list of required headers, adding errors as needed
    rows.forEach((row, rowIndex) => {
      for (const requiredFieldByHeader of requiredFieldsByHeader) {
        const columnIndex = headers.indexOf(requiredFieldByHeader);

        const rowValueForColumn = row[columnIndex];

        // Add an error if the cell value is empty
        if (!rowValueForColumn) {
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

export interface ICodeValuesByHeader {
  codeValues: (string | number)[];
  header: string;
}

export interface IValueRangesByHeader {
  min_value: number;
  max_value: number;
  header: string;
}

/**
 * For each item in `codeValuesByHeader`, adds an error for each row cell whose value does not match a codeValue.
 *
 * Note: If the cell is empty, this check will be skipped.  Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ICodeValuesByHeader[]} [codeValuesByHeader]
 * @return {*}  {CSVValidator}
 */
export const getCodeValueFieldsValidator = (requiredCodeValuesByHeader?: ICodeValuesByHeader[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!requiredCodeValuesByHeader?.length) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headers = csvWorksheet.getHeaders();

    rows.forEach((row, rowIndex) => {
      for (const codeValuesByHeader of requiredCodeValuesByHeader) {
        const columnIndex = headers.indexOf(codeValuesByHeader.header);

        const rowValueForColumn = row[columnIndex];

        if (!rowValueForColumn) {
          // cell is empty, use the getRequiredFieldsValidator to assert required fields
          return;
        }

        // Add an error if the cell value is not one of the elements in the codeValues array
        if (!codeValuesByHeader.codeValues.includes(rowValueForColumn)) {
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: 'Missing Required Field',
              message: `Invalid value: ${rowValueForColumn}. Must be one of [${codeValuesByHeader.codeValues.join(
                ', '
              )}], for column`,
              col: codeValuesByHeader.header,
              row: rowIndex + 2
            }
          ]);
        }
      }
    });

    return csvWorksheet;
  };
};

/**
 * For each item in `codeValuesByHeader`, adds an error for each row cell whose value does not match a codeValue.
 *
 * Note: If the cell is empty, this check will be skipped.  Use the `getRequiredFieldsValidator` validator to assert
 * required fields.
 *
 * @param {ICodeValuesByHeader[]} [codeValuesByHeader]
 * @return {*}  {CSVValidator}
 */
export const getValidRangeFieldsValidator = (requiredRangeByHeader?: IValueRangesByHeader[]): CSVValidator => {
  return (csvWorksheet) => {
    if (!requiredRangeByHeader) {
      return csvWorksheet;
    }

    const rows = csvWorksheet.getRows();
    const headers = csvWorksheet.getHeaders();

    rows.forEach((row, rowIndex) => {
      for (const valueRangesByHeader of requiredRangeByHeader) {
        const columnIndex = headers.indexOf(valueRangesByHeader.header);

        const rowValueForColumn = row[columnIndex];

        if (!rowValueForColumn) {
          // cell is empty, use the getRequiredFieldsValidator to assert required fields
          return;
        }

        // Add an error if the cell value is not in the correct range provided in the array

        if (valueRangesByHeader.min_value <= rowValueForColumn || valueRangesByHeader.max_value >= rowValueForColumn) {
          csvWorksheet.csvValidation.addRowErrors([
            {
              errorCode: 'Out of Range',
              message: `Invalid: ${rowValueForColumn}. Must be between  [${valueRangesByHeader.min_value} and ${valueRangesByHeader.max_value}, for column`,
              col: valueRangesByHeader.header,
              row: rowIndex + 2
            }
          ]);
        }
      }
    });

    return csvWorksheet;
  };
};
