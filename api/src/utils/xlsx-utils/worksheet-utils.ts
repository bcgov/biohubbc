import { default as dayjs } from 'dayjs';
import xlsx, { CellObject } from 'xlsx';
import { ApiGeneralError } from '../../errors/api-error';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  CritterbaseService
} from '../../services/critterbase-service';
import { getLogger } from '../logger';
import { MediaFile } from '../media/media-file';
import { DEFAULT_XLSX_SHEET_NAME } from '../media/xlsx/xlsx-file';
import { safeToLowerCase } from '../string-utils';
import { replaceCellDates, trimCellWhitespace } from './cell-utils';

const defaultLog = getLogger('src/utils/xlsx-utils/worksheet-utils');

export interface IXLSXCSVValidator {
  columnNames: string[];
  columnTypes: string[];
  columnAliases?: Record<string, string[]>;
}

export type TsnMeasurementMap = Record<
  string,
  { qualitative: CBQualitativeMeasurementTypeDefinition[]; quantitative: CBQuantitativeMeasurementTypeDefinition[] }
>;

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
  sheet = DEFAULT_XLSX_SHEET_NAME
): boolean {
  // Validate the worksheet headers
  if (!validateWorksheetHeaders(xlsxWorksheets[sheet], columnValidator)) {
    defaultLog.debug({ label: 'validateCsvFile', message: 'Invalid: Headers' });
    return false;
  }

  // Validate the worksheet column types
  if (!validateWorksheetColumnTypes(xlsxWorksheets[sheet], columnValidator)) {
    defaultLog.debug({ label: 'validateCsvFile', message: 'Invalid: Column types' });
    return false;
  }

  return true;
}

export interface IMeasurementDataToValidate {
  tsn: string;
  measurement_key: string; // Column name, Grid table field or measurement_taxon_id to validate
  measurement_value: string | number;
}

/**
 * Checks if all passed in measurement data is valid or returns false at first invalid measurement.
 *
 * @param {IMeasurementDataToValidate[]} data The measurement data to validate
 * @param {TsnMeasurementMap} tsnMeasurementMap An object map of measurement definitions from Critterbase organized by TSN numbers
 * @returns {*} boolean Results of validation
 */
export function validateMeasurements(
  data: IMeasurementDataToValidate[],
  tsnMeasurementMap: TsnMeasurementMap
): boolean {
  return data.every((item) => {
    const measurements = tsnMeasurementMap[item.tsn];

    if (!measurements) {
      defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid: No measurements' });
      return false;
    }

    // only validate if the column has data
    if (!item.measurement_value) {
      return true;
    }

    // find the correct measurement
    if (measurements.qualitative.length > 0) {
      const measurement = measurements.qualitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQualitativeValueValid(item.measurement_value, measurement);
      }
    }

    if (measurements.quantitative.length > 0) {
      const measurement = measurements.quantitative.find(
        (measurement) =>
          measurement.measurement_name.toLowerCase() === item.measurement_key.toLowerCase() ||
          measurement.taxon_measurement_id === item.measurement_key
      );
      if (measurement) {
        return isQuantitativeValueValid(Number(item.measurement_value), measurement);
      }
    }

    // Has measurements for tsn
    // Has data but no matches found, entry is invalid
    defaultLog.debug({ label: 'validateMeasurements', message: 'Invalid', item });
    return false;
  });
}

/**
 * Preps provided work sheet row object data (rows) to be validated against given TsnMeasurementMap
 *
 * @param {Record<string, any>[]} rows
 * @param {string[]} measurementColumns
 * @param {TsnMeasurementMap} tsnMeasurementMap
 * @returns {*} boolean
 */
export function validateCsvMeasurementColumns(
  rows: Record<string, any>[],
  measurementColumns: string[],
  tsnMeasurementMap: TsnMeasurementMap
): boolean {
  const mappedData: IMeasurementDataToValidate[] = rows.flatMap((row) => {
    return measurementColumns.map((mColumn) => ({
      tsn: String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']),
      measurement_key: mColumn,
      measurement_value: row[mColumn]
    }));
  });
  return validateMeasurements(mappedData, tsnMeasurementMap);
}

/**
 * This function take a value and a measurement to validate against. `CBQuantitativeMeasurementTypeDefinition` can contain
 * a range of valid values, so the incoming value is compared against the min max values in the type definition.
 *
 * @param {number} value The measurement value to validate
 * @param {CBQuantitativeMeasurementTypeDefinition} measurement The type definition of the measurement from Critterbase
 * @returns {*} Boolean
 */
export function isQuantitativeValueValid(value: number, measurement: CBQuantitativeMeasurementTypeDefinition): boolean {
  const min_value = measurement.min_value;
  const max_value = measurement.max_value;

  if (min_value && max_value) {
    if (min_value <= value && value <= max_value) {
      return true;
    }
  }

  if (min_value !== null && min_value <= value) {
    return true;
  }

  if (max_value !== null && value <= max_value) {
    return true;
  }

  if (min_value === null && max_value === null) {
    return true;
  }

  defaultLog.debug({ label: 'isQuantitativeValueValid', message: 'Invalid', value, measurement });
  return false;
}

/**
 *  This function validates the value provided against a Qualitative Measurement.
 * As a string, the function will compare the value against known option labels and will return true if any are found.
 * As a number, the function will compare the value against the option values (the position or index of the option) and will return true if any are found.
 *
 * @param {string | number} value the value to validate
 * @param {CBQualitativeMeasurementTypeDefinition} measurement The type definition of the measurement from Critterbase
 * @returns {*} Boolean
 */
export function isQualitativeValueValid(
  value: string | number,
  measurement: CBQualitativeMeasurementTypeDefinition
): boolean {
  // Check for option value, label OR option uuid
  const foundOption = measurement.options.find(
    (option) =>
      option.option_value === Number(value) ||
      option.option_label.toLowerCase() === String(value).toLowerCase() ||
      option.qualitative_option_id.toLowerCase() === String(value)
  );

  if (foundOption) {
    return true;
  }

  defaultLog.debug({ label: 'isQualitativeValueValid', message: 'Invalid', value, measurement });
  return false;
}

/**
 * This function pulls out any measurement (non required columns) from a CSV so they can be processed properly.
 *
 * @param {xlsx.WorkSheet} xlsxWorksheets The worksheet to pull the columns from
 * @param {IXLSXCSVValidator} columnValidator Column validator
 * @param {string} sheet The sheet to work on
 * @returns {*} string[] The list of measurement columns found in the CSV
 */
export function getMeasurementColumnNameFromWorksheet(
  xlsxWorksheets: xlsx.WorkSheet,
  columnValidator: IXLSXCSVValidator,
  sheet = DEFAULT_XLSX_SHEET_NAME
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

/**
 * Fetch all measurements from critter base for TSN numbers found in provided worksheet
 *
 * @param {xlsx.WorkSheet} xlsxWorksheets The worksheet to pull the columns from
 * @param {CritterbaseService} critterBaseService
 * @param {string} sheet The sheet to work on
 * @returns {*} Promise<TsnMeasurementMap>
 */
export async function getCBMeasurementsFromWorksheet(
  xlsxWorksheets: xlsx.WorkSheet,
  critterBaseService: CritterbaseService,
  sheet = DEFAULT_XLSX_SHEET_NAME
): Promise<TsnMeasurementMap> {
  const rows = getWorksheetRowObjects(xlsxWorksheets[sheet]);
  const tsns = rows.map((row) => String(row['ITIS_TSN'] ?? row['TSN'] ?? row['TAXON'] ?? row['SPECIES']));
  return getCBMeasurementsFromTSN(tsns, critterBaseService);
}

/**
 * Fetches measurement definitions from critterbase for a given list of TSNs and creates and returns a map with all data fetched
 * Throws if a TSN does not return measurements.
 *
 * @param {string[]} tsns List of TSNs
 * @param {CritterbaseService} critterBaseService Critterbase service
 * @returns {*} Promise<TsnMeasurementMap>
 */
export async function getCBMeasurementsFromTSN(
  tsns: string[],
  critterBaseService: CritterbaseService
): Promise<TsnMeasurementMap> {
  const tsnMeasurements: TsnMeasurementMap = {};
  try {
    for (const tsn of tsns) {
      if (!tsnMeasurements[tsn]) {
        const measurements = await critterBaseService.getTaxonMeasurements(tsn);
        if (!measurements) {
          throw new Error(`No measurements found for tsn: ${tsn}`);
        }

        tsnMeasurements[tsn] = measurements;
      }
    }
  } catch (error) {
    getLogger('utils/xlsx-utils').error({ label: 'getCBMeasurementsFromWorksheet', message: 'error', error });
    throw new ApiGeneralError(`Error connecting to the Critterbase API: ${error}`);
  }
  return tsnMeasurements;
}

/**
 * Search for a measurement given xlsx column name and tsn id
 *
 * @param {string} tsn
 * @param {string} measurementColumnName
 * @param {TsnMeasurementMap} tsnMeasurements
 * @returns {*} CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined
 */
export function findMeasurementFromTsnMeasurements(
  tsn: string,
  measurementColumnName: string,
  tsnMeasurements: TsnMeasurementMap
): CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition | null | undefined {
  const measurements = tsnMeasurements[tsn];

  if (!measurements) {
    // No measurements for tsn
    return null;
  }

  if (measurements.qualitative.length > 0) {
    const qualitativeMeasurement = measurements.qualitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (qualitativeMeasurement) {
      // Found qualitative measurement  for tsn
      return qualitativeMeasurement;
    }
  }

  if (measurements.quantitative.length > 0) {
    const quantitativeMeasurement = measurements.quantitative.find(
      (measurement) => measurement.measurement_name.toLowerCase() === measurementColumnName.toLowerCase()
    );

    if (quantitativeMeasurement) {
      // Found quantitative measurement for tsn
      return quantitativeMeasurement;
    }
  }

  // No measurements found for tsn
  return null;
}

/**
 * Type guard to check if a given item is a `CBQualitativeMeasurementTypeDefinition`.
 *
 * Qualitative measurements have an `options` property, while quantitative measurements do not.
 *
 * @export
 * @param {(CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition)} item
 * @return {*}  {item is CBQualitativeMeasurementTypeDefinition}
 */
export function isMeasurementCBQualitativeTypeDefinition(
  item: CBQuantitativeMeasurementTypeDefinition | CBQualitativeMeasurementTypeDefinition
): item is CBQualitativeMeasurementTypeDefinition {
  return 'options' in item;
}
