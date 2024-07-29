import { Row } from '../../services/import-services/csv-import-strategy.interface';
import { IXLSXCSVColumn, IXLSXCSVValidator } from './worksheet-utils';

// TODO: Move the IXLSXCSVValidator type to this file

/**
 * Get column names / headers from column validator.
 *
 * Note: This actually returns Uppercase<string>[] but for convenience we define the return as string[]
 *
 * @param {IXLSXCSVValidator} columnValidator
 * @returns {*} {string[]} Column names / headers
 */
export const getColumnNamesFromValidator = (columnValidator: IXLSXCSVValidator): string[] => {
  return Object.keys(columnValidator);
};

/**
 * Get flattened list of ALL column aliases from column validator.
 *
 * Note: This actually returns Uppercase<string>[] but for convenience we define the return as string[]
 *
 * @param {IXLSXCSVValidator} columnValidator
 * @returns {*} {string[]} Column aliases
 */
export const getColumnAliasesFromValidator = (columnValidator: IXLSXCSVValidator): string[] => {
  const columnNames = getColumnNamesFromValidator(columnValidator);

  // Return flattened list of column validator aliases
  return columnNames.flatMap((columnName) => (columnValidator[columnName] as IXLSXCSVColumn).aliases ?? []);
};

/**
 * Get column validator specification as a readable format. Useful for error handling and logging.
 *
 * @param {IXLSXCSVValidator} columnValidator - Standard column validator
 * @returns {*}
 */
export const getColumnValidatorSpecification = (columnValidator: IXLSXCSVValidator) => {
  // Expected formats of date/time columns
  const columnFormatMap: Partial<Record<IXLSXCSVColumn['type'], string>> = {
    date: 'YYYY-MM-DD',
    time: 'HH:mm:ss'
  };

  return Object.keys(columnValidator).map((columnName) => {
    const columnSpec: IXLSXCSVColumn = columnValidator[columnName];
    return {
      columnName: columnName,
      columnType: columnSpec.type,
      columnFormat: columnFormatMap?.[columnSpec.type],
      columnAliases: columnSpec?.aliases
    };
  });
};

/**
 * Generate a cell getter from a column validator.
 *
 * Note: This will attempt to retrive the cell value from the row by the known header first.
 * If not found, it will then attempt to retrieve the value by the column header aliases.
 *
 * TODO: Can the internal typing for this be improved (without the `as` cast)?
 *
 * @example
 * const getCellValue = generateCellGetterFromColumnValidator(columnValidator)
 * const itis_tsn = getCellValue(row, 'ITIS_TSN')
 *
 * @template T
 * @param {T} columnValidator - Column validator
 * @returns {*}
 */
export const generateCellGetterFromColumnValidator = <T extends IXLSXCSVValidator>(columnValidator: T) => {
  return <J = any>(row: Row, validatorKey: keyof T): J | undefined => {
    // Cast the columnValidatorKey to a string for convienience
    const key = validatorKey as string;

    // Attempt to retrieve the cell value from the default column name
    if (row[key]) {
      return row[key];
    }

    const columnSpec = columnValidator[validatorKey] as IXLSXCSVColumn;

    // Get the column aliases
    const aliases = columnSpec.aliases ?? [];

    // Loop through the aliases and attempt to retrieve the cell value
    for (const alias of aliases) {
      if (row[alias]) {
        return row[alias];
      }
    }
  };
};
