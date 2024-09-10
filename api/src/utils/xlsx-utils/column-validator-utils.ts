import { Row } from '../../services/import-services/import-csv.interface';
import { IXLSXCSVColumn, IXLSXCSVValidator } from './worksheet-utils';

// TODO: Move the IXLSXCSVValidator type to this file

export type CellObject<CellType = any> = { column: string; cell: CellType | undefined };

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

  return Object.keys(columnValidator).map((columnName) => {
    const columnSpec: IXLSXCSVColumn = columnValidator[columnName];
    return {
      columnName: columnName,
      columnType: columnSpec.type,
      columnAliases: columnSpec.aliases,
      optional: columnSpec.optional
    };
  });
};

/**
 * Generate a column + cell getter from a column validator.
 *
 * Note: This will attempt to retrieve the column header and cell value from the row by the known header first.
 * If not found, it will then attempt to retrieve the value by the column header aliases.
 *
 * @example
 * const getColumnCell = generateColumnCellGetterFromColumnValidator(columnValidator)
 *
 * const itis_tsn = getColumnCell(row, 'ITIS_TSN').cell
 * const tsnColumn = getColumnCell(row, 'ITIS_TSN').column
 *
 * @template ValidatorType
 * @param {ValidatorType} columnValidator - Column validator
 * @returns {*}
 */
export const generateColumnCellGetterFromColumnValidator = <ValidatorType extends IXLSXCSVValidator>(
  columnValidator: ValidatorType
) => {
  return <CellType = any>(row: Row, validatorKey: keyof ValidatorType): CellObject<CellType> => {
    // Cast the columnValidatorKey to a string for convienience
    const key = validatorKey as string;

    // Attempt to retrieve the column and cell value from the default column name
    if (row[key]) {
      return { column: key, cell: row[key] };
    }

    const columnSpec = columnValidator[validatorKey] as IXLSXCSVColumn;

    // Get the column aliases
    const aliases = columnSpec.aliases ?? [];

    // Loop through the aliases and attempt to retrieve the column and cell value
    for (const alias of aliases) {
      if (row[alias]) {
        return { column: alias, cell: row[alias] };
      }
    }

    // Returning the provided key when no match
    return { column: key, cell: undefined };
  };
};
