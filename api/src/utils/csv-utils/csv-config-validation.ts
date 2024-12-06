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
 * @template StaticHeaderType - The CSV static headers
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfigType} config - The CSV configuration
 * @returns {*} {{ errors: CSVError[]; rows: CSVRowValidated[] }} - The CSV errors and rows
 */
export const validateCSVWorksheet = <StaticHeaderType extends Uppercase<string>>(
  worksheet: WorkSheet,
  config: CSVConfig<StaticHeaderType>
): { errors: CSVError[]; rows: CSVRowValidated<StaticHeaderType>[] } => {
  const rows: CSVRowValidated<StaticHeaderType>[] = [];
  const errors = validateCSVHeaders(worksheet, config);

  // If there are errors in the headers, return early
  if (errors.length) {
    return { errors: errors, rows: [] };
  }

  // Iterate over each cell in the worksheet and validate + set cell values
  forEachCSVCell(worksheet, config, (params, headerConfig) => {
    // Validate the cell value and modify the errors
    executeValidateCell(params, headerConfig, errors); // Mutates `errors`

    // If there are errors in the cell don't set the cell value
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

  if (!configUtils.worksheetHeaders.length) {
    return [
      {
        error: 'No columns in the file',
        solution: 'Add column names. Did you accidentally include an empty first row above the columns?',
        values: configUtils.configStaticHeaders,
        errorRowIndex: 0
      }
    ];
  }

  if (!configUtils.worksheetRows.length) {
    return [
      {
        error: 'No rows in the file',
        solution: 'Add rows. Did you accidentally import the wrong file?',
        errorRowIndex: 1
      }
    ];
  }

  const worksheetStaticHeaders = new Set(configUtils.worksheetStaticHeaders);

  for (const staticHeader of configUtils.configStaticHeaders) {
    const headerConfig = config.staticHeadersConfig[staticHeader];
    const worksheetHasStaticHeader = worksheetStaticHeaders.has(staticHeader);

    // Validate the CSV is not missing a required header
    if (!headerConfig.optional && !worksheetHasStaticHeader) {
      csvErrors.push({
        error: 'A required column is missing',
        solution: `Add all required columns to the file.`,
        header: staticHeader,
        values: [staticHeader, ...config.staticHeadersConfig[staticHeader].aliases],
        errorRowIndex: 0
      });
    }
  }

  // Validate the CSV has no unknown headers (if dynamic headers not ignored or allowed)
  if (!config.ignoreDynamicHeaders && !config.dynamicHeadersConfig && configUtils.worksheetDynamicHeaders.length) {
    for (const unknownHeader of configUtils.worksheetDynamicHeaders) {
      csvErrors.push({
        error: 'An unknown column is included in the file',
        solution: `Remove extra columns from the file.`,
        header: unknownHeader,
        errorRowIndex: 0
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
        rowIndex: i,
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
  const headerKey = params.staticHeader?.toUpperCase() ?? params.header.toUpperCase();
  const cellValue = headerConfig?.setCellValue?.(params) ?? params.cell;

  // Remove the aliased header if it is not the static header
  if (params.staticHeader && params.header !== params.staticHeader) {
    delete params.row[params.header];
  }

  params.row[headerKey] = cellValue;

  mutableRows[params.rowIndex] = params.row;
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
        errorRowIndex: error.errorRowIndex ?? params.rowIndex + 1 // headers: 0, data row: 1
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
