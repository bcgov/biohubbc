import { WorkSheet } from 'xlsx';
import { getWorksheetRowObjects } from '../xlsx-utils/worksheet-utils';
import { CSVConfigUtils } from './csv-config-utils';
import {
  CSVConfig,
  CSVError,
  CSVHeaderConfig,
  CSVParams,
  CSVRow,
  CSVRowValidated
} from './csv-config-validation.interface';

/**
 * Validate the CSV worksheet with the CSV config.
 *
 * @template CSVConfigType - The CSV configuration type
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfigType} config - The CSV configuration
 * @returns {*} {{ errors: CSVError[]; rows: CSVRowValidated[] }} - The CSV errors and rows
 */
export const validateCSVWorksheet = <CSVConfigType extends CSVConfig>(
  worksheet: WorkSheet,
  config: CSVConfigType
): { errors: CSVError[]; rows: CSVRowValidated<CSVConfigType>[] } => {
  const rows: CSVRowValidated<CSVConfigType>[] = [];
  const errors = validateCSVHeaders(worksheet, config);

  // If there are errors in the headers, return early
  if (errors.length) {
    return { errors: errors, rows: [] };
  }

  // Iterate over each cell in the worksheet and validate + set cell values
  forEachCSVCell(worksheet, config, (params, headerConfig) => {
    // Validate the cell value and modify the errors
    executeValidateCell(params, headerConfig, errors); // Mutates `errors`

    if (errors.length) {
      return;
    }

    // Set the cell value and modify the rows
    executeSetCellValue(params, headerConfig, rows); // Mutates `rows`
  });

  if (errors.length) {
    return { errors: errors, rows: [] };
  }

  return { errors: [], rows: rows };
};

/**
 * Validate the CSV static and dynamic headers against the CSV config.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @returns {*} {CSVError[]} - The CSV errors
 */
export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
  const csvErrors: CSVError[] = [];

  const configUtils = new CSVConfigUtils(worksheet, config);

  if (!configUtils.headers.length) {
    return [{ rowIndex: 0, error: 'CSV empty', solution: 'Add headers and data to CSV' }];
  }

  if (!configUtils.worksheetRows.length) {
    return [{ rowIndex: 1, error: 'CSV missing rows', solution: 'Add data to CSV' }];
  }

  for (const [staticHeader, headerConfig] of Object.entries(config.staticHeadersConfig)) {
    const worksheetHasStaticHeader = configUtils.staticHeaders.some((header) =>
      [staticHeader, ...headerConfig.aliases].includes(header)
    );

    // Validate the CSV is not missing a required header
    if (!worksheetHasStaticHeader) {
      csvErrors.push({
        error: 'CSV missing required header',
        solution: `Add header '${staticHeader}' to CSV`,
        header: staticHeader,
        rowIndex: 0
      });
    }
  }

  // Validate the CSV has no unknown headers (if dynamic headers not ignored or allowed)
  if (!config.ignoreDynamicHeaders && !config.dynamicHeadersConfig && configUtils.dynamicHeaders.length) {
    for (const unknownHeader of configUtils.dynamicHeaders) {
      csvErrors.push({
        error: 'Unknown header in CSV',
        solution: `Remove header '${unknownHeader}' from CSV`,
        header: unknownHeader,
        rowIndex: 0
      });
    }
  }

  return csvErrors;
};

/**
 * Iterate over each cell in the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @param {(params: CSVParams, headerConfig: CSVHeaderConfig) => void} callback - The callback function
 * @returns {*} {void}
 */
export const forEachCSVCell = (
  worksheet: WorkSheet,
  config: CSVConfig,
  callback: (params: CSVParams, headerConfig: CSVHeaderConfig) => void
): void => {
  const staticHeaderConfigMap = _getCSVStaticHeaderMap(config);
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 0; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    for (const header in worksheetRow) {
      // Get the header config for the cell (static or dynamic)
      const headerConfig = staticHeaderConfigMap.get(header) ?? config.dynamicHeadersConfig ?? {};
      const cell = worksheetRow[header];
      const params: CSVParams = {
        cell,
        header,
        row: worksheetRow,
        rowIndex: i + 1,
        staticHeader: staticHeaderConfigMap.get(header)?.staticHeader
      };

      callback(params, {
        validateCell: headerConfig.validateCell,
        setCellValue: headerConfig.setCellValue
      });
    }
  }
};

/**
 * Execute the CSVConfig `setCellValue` callback for the cell.
 *
 * Note: This mutates the CSV row objects `mutableRows`.
 *
 * @param {CSVParams} params - The CSV parameters
 * @param {CSVHeaderConfig} headerConfig - The header configuration
 * @param {CSVRow[]} mutableRows - The mutable rows array
 * @returns {*} {CSVRow[]} - The updated row
 */
export const executeSetCellValue = (params: CSVParams, headerConfig: CSVHeaderConfig, mutableRows: CSVRow[]) => {
  if (!headerConfig.setCellValue) {
    return;
  }

  if (params.staticHeader) {
    delete params.row[params.header];
    params.row[params.staticHeader.toUpperCase()] = headerConfig.setCellValue(params);
  } else {
    params.row[params.header.toUpperCase()] = headerConfig.setCellValue(params);
  }

  mutableRows[params.rowIndex - 1] = params.row;
};

/**
 * Execute the CSVConfig `validateCell` callback for the cell.
 *
 * Note: This mutates the CSV errors array `mutableErrors`.
 *
 * @param {CSVParams} params - The CSV parameters
 * @param {CSVHeaderConfig} headerConfig - The header configuration
 * @param {CSVError[]} mutableErrors - The mutable errors array
 * @returns {*} {void}
 */
export const executeValidateCell = (
  params: CSVParams,
  headerConfig: CSVHeaderConfig,
  mutableErrors: CSVError[]
): void => {
  if (!headerConfig.validateCell) {
    return;
  }

  const cellErrors = headerConfig.validateCell(params);

  if (cellErrors.length) {
    cellErrors.forEach((error) => {
      mutableErrors.push({
        error: error.error,
        solution: error.solution,
        values: error.values,
        cell: error.cell ?? params.cell,
        header: error.header ?? params.header,
        rowIndex: error.rowIndex ?? params.rowIndex
      });
    });
  }
};

/**
 * Get the header config map for the CSV worksheet staticHeaders and aliases.
 *
 * Maps the header / alias name to the header config.
 *
 * @param {CSVConfig} config - The CSV configuration
 * @returns {*} {Map<string, CSVHeaderConfig & { staticHeader: string }>} - The header config Map
 */
export const _getCSVStaticHeaderMap = (config: CSVConfig) => {
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
