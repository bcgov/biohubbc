import xlsx from 'xlsx';
import { observationStandardColumnValidator } from '../xlsx-utils/column-cell-utils';
import { getHeadersUpperCase } from '../xlsx-utils/worksheet-utils';

/**
 * This function pulls out any non-standard columns from a CSV so they can be processed separately.
 *
 * @param {xlsx.WorkSheet} xlsxWorksheet The worksheet to pull the columns from
 * @returns {*} string[] The list of non-standard columns found in the CSV
 */
export function getNonStandardColumnNamesFromWorksheet(xlsxWorksheet: xlsx.WorkSheet): string[] {
  const columns = getHeadersUpperCase(xlsxWorksheet);

  let aliasColumns: string[] = [];
  // Create a list of all column names and aliases
  if (observationStandardColumnValidator.columnAliases) {
    aliasColumns = Object.values(observationStandardColumnValidator.columnAliases).flat();
  }

  const standardColumNames = [...observationStandardColumnValidator.columnNames, ...aliasColumns];

  // Only return column names not in the validation CSV Column validator (ie: only return the non-standard columns)
  return columns.filter((column) => !standardColumNames.includes(column));
}
