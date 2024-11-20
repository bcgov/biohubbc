import { WorkSheet } from 'xlsx';
import { getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfig, CSVError, CSVHeader, CSVParams, CSVRow } from './csv-utils.interface';

/**
 * Get the config map for the CSV headers.
 *
 * @param {CSVConfig} config - The CSV configuration
 * @returns {Map<string, CSVHeader>} - The header config Map
 */
export const getCSVConfigMap = (config: CSVConfig) => {
  const headerMap = new Map<string, CSVHeader>();

  for (const headerConfig of config.headers) {
    for (const header of headerConfig.headerNames) {
      if (headerMap.has(header.toUpperCase())) {
        throw new Error(`Duplicate header in CSV config: ${header}`);
      }
      headerMap.set(header.toUpperCase(), headerConfig);
    }
  }

  return headerMap;
};

/**
 * Get the worksheet headers that are known to the CSV config.
 *
 * ie: config: A,B,C - worksheet: A,B,D - known: A,B
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {string[]} - The known worksheet headers
 */
export const getCSVWorksheetKnownHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const configMap = getCSVConfigMap(config);
  return Object.keys(worksheet[0]).filter((header) => configMap.has(header));
};

/**
 * Get the worksheet headers that are unknown to the CSV config.
 *
 * ie: config: A,B,C - worksheet: A,D,E - known: D,E
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {string[]} - The known worksheet headers
 */
export const getCSVWorksheetUnknownHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const configMap = getCSVConfigMap(config);
  return Object.keys(worksheet[0]).filter((header) => !configMap.has(header));
};

/**
 * Iterate over each cell in the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @param {(params: CSVParams, csvHeaderConfig?: CSVHeader) => void} callback - The callback function
 * @returns {void}
 */
export const forEachCSVCell = (
  worksheet: WorkSheet,
  config: CSVConfig,
  callback: (params: CSVParams, csvHeaderConfig?: CSVHeader) => void
): void => {
  const configMap = getCSVConfigMap(config);
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 1; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    for (const header in worksheetRow) {
      const csvHeaderConfig = configMap.get(header);
      const cell = worksheetRow[header];
      const params = { cell, header, row: worksheetRow, rowIndex: i + 1, worksheet };

      callback(params, csvHeaderConfig);
    }
  }
};

/**
 * Validate the CSV headers against the CSV config.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {CSVError[]} - The CSV errors
 */
export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
  const csvErrors: CSVError[] = [];

  const allHeaders = Object.keys(worksheet[0]);
  const knownHeaders = getCSVWorksheetKnownHeaders(worksheet, config);
  const unknownHeaders = getCSVWorksheetUnknownHeaders(worksheet, config);

  if (!allHeaders.length) {
    return [{ rowIndex: 0, error: 'CSV is empty', solution: 'Add headers and data to CSV' }];
  }

  for (const headerConfig of config.headers) {
    for (const header of headerConfig.headerNames) {
      if (!knownHeaders.includes(header)) {
        csvErrors.push({
          rowIndex: 0,
          error: 'CSV missing required header',
          header: header,
          solution: `Add header '${header}' to CSV`
        });
      }
    }
  }

  if (config.ignoreUnknownHeaders && unknownHeaders.length) {
    for (const unknownHeader of unknownHeaders) {
      csvErrors.push({
        rowIndex: 0,
        error: 'Unknown header in CSV',
        header: unknownHeader,
        solution: `Remove header '${unknownHeader}' from CSV`
      });
    }
  }

  return csvErrors;
};

/**
 * Validate the CSV cells against the CSV config.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {CSVError[]} - The CSV errors
 */
export const validateCSVCells = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
  const csvErrors: CSVError[] = [];

  forEachCSVCell(worksheet, config, (params, csvHeaderConfig) => {
    if (csvHeaderConfig) {
      csvErrors.push(...csvHeaderConfig.validateCell(params));
    }

    if (!csvHeaderConfig && config.validateUnknownCell) {
      csvErrors.push(...config.validateUnknownCell(params));
    }
  });

  return csvErrors;
};

/**
 * Set the cell values for the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {CSVRow[]} - The CSV rows
 */
export const setCSVCellValues = (worksheet: WorkSheet, config: CSVConfig): CSVRow[] => {
  const rows: CSVRow[] = [];

  forEachCSVCell(worksheet, config, (params, csvHeaderConfig) => {
    const row = params.row;
    let cellValue = params.cell;

    if (csvHeaderConfig) {
      cellValue = csvHeaderConfig.setCellValue ? csvHeaderConfig.setCellValue(params) : params.cell;

      delete row[params.header];
      row[csvHeaderConfig.$property] = cellValue;
    } else {
      cellValue = config.setUnknownCellValue ? config.setUnknownCellValue(params) : params.cell;

      row[params.header] = cellValue;
    }
  });

  return rows;
};

/**
 * Validate the CSV worksheet against the CSV config.
 * Note: This function is a helpful wrapper for the `normal` flow of the validation process.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {{ errors: CSVError[]; rows: CSVRow[] }} - The CSV errors and rows
 */
export const validateCSVWorksheet = (
  worksheet: WorkSheet,
  config: CSVConfig
): { errors: CSVError[]; rows: CSVRow[] } => {
  const headerErrors = validateCSVHeaders(worksheet, config);

  if (headerErrors.length) {
    return { errors: headerErrors, rows: [] };
  }

  const cellErrors = validateCSVCells(worksheet, config);

  if (cellErrors.length) {
    return { errors: cellErrors, rows: [] };
  }

  const mutatedRows = setCSVCellValues(worksheet, config);

  return { errors: [], rows: mutatedRows };
};
