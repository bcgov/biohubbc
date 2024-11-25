import { WorkSheet } from 'xlsx';
import { getHeadersUpperCase, getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfig, CSVError, CSVHeaderConfig, CSVParams, CSVRow } from './csv-config-utils.interface';
/**
 * Some notes:
 *
 * Static Headers: Headers that are defined in the CSV configuration.
 * Dynamic Headers: Headers that are not defined in the CSV configuration. ie: additional headers in the CSV.
 */

export const getCSVCellValue = <T extends CSVConfig>(
  header: keyof T['staticHeadersConfig'],
  row: CSVRow,
  config: T
) => {
  if (header in row) {
    return row[header as Uppercase<string>];
  }

  for (const alias of config.staticHeadersConfig[header as Uppercase<string>].aliases) {
    if (alias in row) {
      return row[alias];
    }
  }
};

/**
 * Get the static headers for the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 */
export const getCSVWorksheetStaticHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const worksheetHeaders = getHeadersUpperCase(worksheet);
  const configMap = getCSVConfigMap(config);
  return worksheetHeaders.filter((header) => configMap.has(header));
};

/**
 * Get the dynamic headers for the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 */
export const getCSVWorksheetDynamicHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const worksheetHeaders = getHeadersUpperCase(worksheet);
  const configMap = getCSVConfigMap(config);
  return worksheetHeaders.filter((header) => !configMap.has(header));
};

/**
 * Get the config map for the CSV worksheet staticHeaders and aliases.
 *
 * Note: This function returns a Map of header names (UPPERCASED) to header config objects.
 *
 * @param {CSVConfig} config - The CSV configuration
 * @returns {Map<string, CSVHeaderConfig & { staticHeader: string }>} - The header config Map
 */
export const getCSVConfigMap = (config: CSVConfig) => {
  const headerMap = new Map<string, CSVHeaderConfig & { staticHeader: string }>();

  for (const [staticHeader, headerConfig] of Object.entries(config.staticHeadersConfig)) {
    for (const header of [staticHeader, ...headerConfig.aliases]) {
      const uppercasedHeader = header.toUpperCase();

      if (headerMap.has(uppercasedHeader)) {
        throw new Error(`Duplicate header in CSV config: ${uppercasedHeader}`);
      }

      headerMap.set(uppercasedHeader, { ...headerConfig, staticHeader });
    }
  }

  return headerMap;
};

/**
 * Iterate over each cell in the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @param {(params: CSVParams, staticHeaderConfig?: CSVHeaderConfig & { staticHeaderConfig: string }) => void} callback - The callback function
 * @returns {void}
 */
export const forEachCSVCell = (
  worksheet: WorkSheet,
  config: CSVConfig,
  callback: (params: CSVParams, staticHeaderConfig?: CSVHeaderConfig & { staticHeader: string }) => void
): void => {
  const configMap = getCSVConfigMap(config);
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 1; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    for (const header in worksheetRow) {
      const staticHeaderConfig = configMap.get(header);
      const cell = worksheetRow[header];
      const params = { cell, header, row: worksheetRow, rowIndex: i + 1, worksheet };

      callback(params, staticHeaderConfig);
    }
  }
};

/**
 * Validate the CSV static and dynamic headers against the CSV config.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {CSVError[]} - The CSV errors
 */
export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
  const csvErrors: CSVError[] = [];

  const worksheetHeaders = getHeadersUpperCase(worksheet);
  const worksheetStaticHeaders = getCSVWorksheetStaticHeaders(worksheet, config);
  const worksheetDynamicHeaders = getCSVWorksheetDynamicHeaders(worksheet, config);

  if (!worksheetHeaders.length) {
    return [{ rowIndex: 0, error: 'CSV is empty', solution: 'Add worksheetHeaders and data to CSV' }];
  }

  for (const [staticHeader, headerConfig] of Object.entries(config.staticHeadersConfig)) {
    const worksheetHasStaticHeader = worksheetStaticHeaders.some((header) =>
      [staticHeader, ...headerConfig.aliases].includes(header)
    );

    if (!worksheetHasStaticHeader) {
      csvErrors.push({
        rowIndex: 0,
        error: 'CSV missing required header',
        header: staticHeader,
        solution: `Add header '${staticHeader}' to CSV`
      });
    }
  }

  if (!config.ignoreDynamicHeaders && !config.dynamicHeadersConfig && worksheetDynamicHeaders.length) {
    for (const unknownHeader of worksheetDynamicHeaders) {
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

  forEachCSVCell(worksheet, config, (params, staticHeaderConfig) => {
    if (staticHeaderConfig?.validateCell) {
      csvErrors.push(...staticHeaderConfig.validateCell(params));
    }

    if (!staticHeaderConfig && config.dynamicHeadersConfig?.validateCell) {
      csvErrors.push(...config.dynamicHeadersConfig.validateCell(params));
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

  forEachCSVCell(worksheet, config, (params, staticHeaderConfig) => {
    if (staticHeaderConfig && staticHeaderConfig.setCellValue) {
      params.row[staticHeaderConfig.staticHeader] = staticHeaderConfig.setCellValue(params);
      delete params.row[params.header];
    }

    if (!staticHeaderConfig && config.dynamicHeadersConfig?.setCellValue) {
      params.row[params.header] = config.dynamicHeadersConfig.setCellValue(params);
    }

    rows[params.rowIndex] = params.row;
  });

  return rows;
};

/**
 * Validate the CSV worksheet with the CSV config.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {{ errors: CSVError[]; rows: CSVRow[] }} - The CSV errors and rows
 */
export const validateCSVWorksheet = (
  worksheet: WorkSheet,
  config: CSVConfig
): { errors: CSVError[]; rows: CSVRow[] } => {
  console.time('validateCSVWorksheet');
  const headerErrors = validateCSVHeaders(worksheet, config);
  console.timeEnd('validateCSVWorksheet');

  if (headerErrors.length) {
    return { errors: headerErrors, rows: [] };
  }

  console.time('validateCSVCells');
  const cellErrors = validateCSVCells(worksheet, config);
  console.timeEnd('validateCSVCells');

  if (cellErrors.length) {
    return { errors: cellErrors, rows: [] };
  }

  console.time('setCSVCellValues');
  const mutatedRows = setCSVCellValues(worksheet, config);
  console.timeEnd('setCSVCellValues');

  return { errors: [], rows: mutatedRows };
};
