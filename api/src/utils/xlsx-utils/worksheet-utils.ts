import { default as dayjs } from 'dayjs';
import xlsx, { CellObject } from 'xlsx';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import { MediaFile } from '../media/media-file';
import { safeToLowerCase } from '../string-utils';
import { replaceCellDates, trimCellWhitespace } from './cell-utils';

export interface IXLSXCSVValidator {
  columnNames: string[];
  columnTypes: string[];
  columnAliases?: Record<string, string[]>;
}

/**
 * Returns true if the given cell is a date type cell.
 *
 * @export
 * @param {MediaFile} file
 * @param {xlsx.ParsingOptions} [options]
 * @return {*}  {xlsx.WorkBook}
 */
export const constructXLSXWorkbook = (file: MediaFile, options?: xlsx.ParsingOptions): xlsx.WorkBook => {
  return xlsx.read(file.buffer, { cellDates: true, cellNF: true, cellHTML: false, ...options });
};

/**
 * Constructs a CSVWorksheets from the given workbook
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @return {*}  {CSVWorksheets}
 */
export const constructWorksheets = (workbook: xlsx.WorkBook): xlsx.WorkSheet => {
  const worksheets: xlsx.WorkSheet = {};

  Object.entries(workbook.Sheets).forEach(([key, value]) => {
    worksheets[key] = value;
  });

  return worksheets;
};

/**
 * Get the headers for the given worksheet, then transforms them to uppercase.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export const getWorksheetHeaders = (worksheet: xlsx.WorkSheet): string[] => {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }
  const customRange: xlsx.Range = { ...originalRange, e: { ...originalRange.e, r: 0 } };

  const aoaHeaders: any[][] = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    range: customRange
  });

  let headers: string[] = [];

  if (aoaHeaders.length > 0) {
    // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
    headers = aoaHeaders[0]
      .map(String)
      .filter(Boolean)
      .map((header) => header.trim().toUpperCase());
  }

  return headers;
};

/**
 * Get the headers for the given worksheet, with all values converted to lowercase.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[]}
 */
export const getHeadersLowerCase = (worksheet: xlsx.WorkSheet): string[] => {
  return getWorksheetHeaders(worksheet).map(safeToLowerCase);
};

/**
 * Get the index of the given header name.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string} headerName
 * @return {*}  {number}
 */
export const getHeaderIndex = (worksheet: xlsx.WorkSheet, headerName: string): number => {
  return getWorksheetHeaders(worksheet).indexOf(headerName);
};

/**
 * Return an array of row value arrays.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {string[][]}
 */
export const getWorksheetRows = (worksheet: xlsx.WorkSheet): string[][] => {
  const originalRange = getWorksheetRange(worksheet);

  if (!originalRange) {
    return [];
  }

  const rowsToReturn: string[][] = [];

  for (let i = 1; i <= originalRange.e.r; i++) {
    const row = new Array(getWorksheetHeaders(worksheet).length);
    let rowHasValues = false;

    for (let j = 0; j <= originalRange.e.c; j++) {
      const cellAddress = { c: j, r: i };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const cell = worksheet[cellRef];

      if (!cell) {
        continue;
      }

      row[j] = trimCellWhitespace(replaceCellDates(cell)).v;

      rowHasValues = true;
    }

    if (row.length && rowHasValues) {
      rowsToReturn.push(row);
    }
  }

  return rowsToReturn;
};

/**
 * Return an array of row value arrays.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {Record<string, any>[]}
 */
export const getWorksheetRowObjects = (worksheet: xlsx.WorkSheet): Record<string, any>[] => {
  const ref = worksheet['!ref'];

  if (!ref) {
    return [];
  }

  const rowObjectsArray: Record<string, any>[] = [];
  const rows = getWorksheetRows(worksheet);
  const headers = getWorksheetHeaders(worksheet);

  rows.forEach((row: string[]) => {
    const rowObject = {};

    headers.forEach((header: string, index: number) => {
      rowObject[header] = row[index];
    });

    rowObjectsArray.push(rowObject);
  });

  return rowObjectsArray;
};

/**
 * Return boolean indicating whether the worksheet has the expected headers.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {IXLSXCSVValidator} columnValidator
 * @return {*}  {boolean}
 */
export const validateWorksheetHeaders = (worksheet: xlsx.WorkSheet, columnValidator: IXLSXCSVValidator): boolean => {
  const { columnNames, columnAliases } = columnValidator;

  const worksheetHeaders = getWorksheetHeaders(worksheet);

  return columnNames.every((expectedHeader) => {
    return (
      columnAliases?.[expectedHeader]?.some((alias) => worksheetHeaders.includes(alias)) ||
      worksheetHeaders.includes(expectedHeader)
    );
  });
};

/**
 * Return boolean indicating whether the worksheet has correct column types. This only checks the required columns in the `columnValidator`
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @param {string[]} rowValueTypes
 * @return {*}  {boolean}
 */
export const validateWorksheetColumnTypes = (
  worksheet: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator
): boolean => {
  const rowValueTypes: string[] = columnValidator.columnTypes;
  const worksheetRows = getWorksheetRows(worksheet);

  return worksheetRows.every((row) => {
    return Object.values(columnValidator.columnNames).every((_, index) => {
      const value = row[index];
      const type = typeof value;
      if (rowValueTypes[index] === 'date') {
        return dayjs(value).isValid();
      }

      return rowValueTypes[index] === type;
    });
  });
};

/**
 * Get a worksheet by name.
 *
 * @export
 * @param {xlsx.WorkBook} workbook
 * @param {string} sheetName
 * @return {*}  {xlsx.WorkSheet}
 */
export const getWorksheetByName = (workbook: xlsx.WorkBook, sheetName: string): xlsx.WorkSheet => {
  return workbook.Sheets[sheetName];
};

/**
 * Get a worksheets decoded range object, or return undefined if the worksheet is missing range information.
 *
 * @export
 * @param {xlsx.WorkSheet} worksheet
 * @return {*}  {(xlsx.Range | undefined)}
 */
export const getWorksheetRange = (worksheet: xlsx.WorkSheet): xlsx.Range | undefined => {
  const ref = worksheet['!ref'];

  if (!ref) {
    return undefined;
  }

  return xlsx.utils.decode_range(ref);
};
/**
 * Iterates over the cells in the worksheet and:
 * - Trims whitespace from cell values.
 * - Converts `Date` objects to ISO strings.
 *
 * https://stackoverflow.com/questions/61789174/how-can-i-remove-all-the-spaces-in-the-cells-of-excelsheet-using-nodejs-code
 * @param worksheet
 */
export const prepareWorksheetCells = (worksheet: xlsx.WorkSheet) => {
  const range = getWorksheetRange(worksheet);

  if (!range) {
    return undefined;
  }

  for (let r = range.s.r; r < range.e.r; r++) {
    for (let c = range.s.c; c < range.e.c; c++) {
      const coord = xlsx.utils.encode_cell({ r, c });
      let cell: CellObject = worksheet[coord];

      if (!cell?.v) {
        // Cell is null or has no raw value
        continue;
      }

      cell = replaceCellDates(cell);

      cell = trimCellWhitespace(cell);
    }
  }
};

/**
 * Validates the given CSV file against the given column validator
 *
 * @param {MediaFile} file
 * @return {*}  {boolean}
 * @memberof ObservationService
 */
export function validateCsvFile(
  xlsxWorksheets: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator,
  sheet = 'Sheet1'
): boolean {
  // Validate the worksheet headers
  if (!validateWorksheetHeaders(xlsxWorksheets[sheet], columnValidator)) {
    return false;
  }

  // Validate the worksheet column types
  if (!validateWorksheetColumnTypes(xlsxWorksheets[sheet], columnValidator)) {
    return false;
  }

  return true;
}

export async function validateCsvMeasurementColumns(
  xlsxWorksheets: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator,
  sheet = 'Sheet1'
): Promise<any> {
  const rows = getWorksheetRows(xlsxWorksheets[sheet]);
  const measurementColumns = getMeasurementColumnNameFromWorksheet(xlsxWorksheets, columnValidator);
  // get measurements from critter base
  // need to search with tsn and column name to find proper measurement
  // it would be best to get all measurements for a given set of TSN values I think...
  // so it would search with tsn + ['column name', 'column name']

  const service = new CritterbaseService({
    keycloak_guid: '',
    username: ''
  });

  const tsnMeasurements: Record<
    string,
    { qualitative: CBQualitativeMeasurementTypeDefinition[]; quantitative: CBQuantitativeMeasurementTypeDefinition[] }
  > = {};

  let isRowValid = true; // defaulting to true so as a column with no data is valid (taxon might not align with measurement column)
  for (const row of rows) {
    // fetch the tsn number
    // TODO: make this a little more generic
    const tsn = row[0];
    // If measurements for the TSN haven't been fetched, grab them
    if (!tsnMeasurements[tsn]) {
      // TODO: wire this up for multiple TSNs instead of
      const measurements = await service.getTaxonMeasurements(tsn);
      console.log(measurements);
      if (!measurements) {
        // TODO: do we care if there are no measurements for a taxon?
      }

      tsnMeasurements[tsn] = measurements;
    }

    // for reach measurement column found
    // validate data against taxon measurements collected from Critter Base
    measurementColumns.forEach((mColumn) => {
      const data = row[mColumn];
      const measurements = tsnMeasurements[tsn];
      // only validate if the column has data
      if (data) {
        // find the correct measurement
        if (measurements.qualitative.length > 0) {
          const measurement = measurements.qualitative.find((measurement) => measurement.measurement_name === mColumn);
          if (measurement) {
            // check if data is in the options for the
            const foundOption = measurement.options.find(
              (option) => option.option_value === data || option.option_label === data
            );

            isRowValid = Boolean(foundOption);
          }
        }

        if (measurements.quantitative.length > 0) {
          const measurement = measurements.quantitative.find((measurement) => measurement.measurement_name === mColumn);
          if (measurement) {
            isRowValid = isQuantitativeValueValid(Number(data), measurement);
          }
        }
      }
    });
  }
  return isRowValid;
}

export function isQuantitativeValueValid(value: number, measurement: CBQuantitativeMeasurementTypeDefinition): boolean {
  const min_value = measurement.min_value;
  const max_value = measurement.max_value;
  let isValid = false;
  if (min_value && max_value) {
    if (min_value <= value && value <= max_value) {
      isValid = true;
    }
  }

  if (min_value && min_value <= value) {
    isValid = true;
  }

  if (max_value && value <= max_value) {
    isValid = true;
  }

  if (min_value === null && max_value === null) {
    isValid = true;
  }
  return isValid;
}

export function getMeasurementColumnNameFromWorksheet(
  xlsxWorksheets: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator,
  sheet = 'Sheet1'
): string[] {
  const columns = getWorksheetHeaders(xlsxWorksheets[sheet]);
  let aliasColumns: string[] = [];
  // Create a list of all column names and aliases
  if (columnValidator.columnAliases) {
    aliasColumns = Object.values(columnValidator.columnAliases).flat();
  }
  const requiredColumns = [...columnValidator.columnNames, ...aliasColumns];
  return columns
    .map((column) => {
      // only return column names not in the validation CSV Column validator (extra/measurement columns)
      if (!requiredColumns.includes(column)) {
        return column;
      }
    })
    .filter((c): c is string => Boolean(c)); // remove undefined/ nulls from the array
}
