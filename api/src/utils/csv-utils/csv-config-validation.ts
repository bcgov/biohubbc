import { WorkSheet } from 'xlsx';
import { getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfigUtils } from './csv-config-utils';
import { CSVConfig, CSVError, CSVHeaderConfig, CSVParams, CSVRow } from './csv-config-validation.interface';

/**
 * Get the config map for the CSV worksheet staticHeaders and aliases.
 *
 * @param {CSVConfig} config - The CSV configuration
 * @returns {Map<string, CSVHeaderConfig & { staticHeader: string }>} - The header config Map
 */
export const _getCSVConfigMap = (config: CSVConfig) => {
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
export const _forEachCSVCell = (
  worksheet: WorkSheet,
  config: CSVConfig,
  callback: (params: CSVParams, staticHeaderConfig?: CSVHeaderConfig & { staticHeader: string }) => void
): void => {
  const configMap = _getCSVConfigMap(config);
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 0; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    for (const header in worksheetRow) {
      const staticHeaderConfig = configMap.get(header);
      const cell = worksheetRow[header];
      const params = { cell, header, row: worksheetRow, rowIndex: i + 1 };

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

  const configUtils = new CSVConfigUtils(worksheet, config);

  if (!configUtils.headers.length) {
    return [{ rowIndex: 0, error: 'CSV is empty', solution: 'Add headers and data to CSV' }];
  }

  for (const [staticHeader, headerConfig] of Object.entries(config.staticHeadersConfig)) {
    const worksheetHasStaticHeader = configUtils.staticHeaders.some((header) =>
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

  if (!config.ignoreDynamicHeaders && !config.dynamicHeadersConfig && configUtils.dynamicHeaders.length) {
    for (const unknownHeader of configUtils.dynamicHeaders) {
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

  _forEachCSVCell(worksheet, config, (params, staticHeaderConfig) => {
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

  _forEachCSVCell(worksheet, config, (params, staticHeaderConfig) => {
    if (staticHeaderConfig && staticHeaderConfig.setCellValue) {
      delete params.row[params.header];
      params.row[staticHeaderConfig.staticHeader.toUpperCase()] = staticHeaderConfig.setCellValue(params);
    }

    if (!staticHeaderConfig && config.dynamicHeadersConfig?.setCellValue) {
      params.row[params.header.toUpperCase()] = config.dynamicHeadersConfig.setCellValue(params);
    }

    rows[params.rowIndex - 1] = params.row;
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
