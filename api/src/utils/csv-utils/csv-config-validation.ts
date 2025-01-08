import { WorkSheet } from 'xlsx';
import { getWorksheetRowObjects, WorksheetRowIndexSymbol } from '../xlsx-utils/worksheet-utils';
import { CSVConfigUtils } from './csv-config-utils';
import {
  CSVConfig,
  CSVError,
  CSVHeaderConfig,
  CSVParams,
  CSVRow,
  CSVRowParams,
  CSVRowState,
  CSVRowValidated,
  CSVRowValidator
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

  // Iterate over each row in the worksheet and execute the row validators
  forEachCSVRow(worksheet, config, (rowParams, rowValidators) => {
    // Execute the row validators and modify the errors
    rowValidators.forEach((rowValidator) => {
      executeRowValidator(rowParams, rowValidator, errors);
      // Update the row state for each row validator
      updateRowState(rowParams, rows);
    });

    // If there are errors in the row abort early
    if (errors.length) {
      return;
    }

    // Iterate over each cell in the row and validate + set cell values
    forEachCSVRowCell(rowParams.row, rowParams.rowIndex, config, (cellParams, headerConfig) => {
      // Validate the cell value and modify the errors
      executeValidateCell(cellParams, headerConfig, errors); // Mutates `errors`

      // If there are errors in the cell don't set the cell value
      if (errors.length) {
        return;
      }

      // Set the cell value and modify the rows
      executeSetCellValue(cellParams, headerConfig, rows); // Mutates `rows`

      // Update the row state for each cell
      updateRowState(rowParams, rows);
    });
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
        header: null,
        cell: null,
        row: 1
      }
    ];
  }

  if (!configUtils.worksheetRows.length) {
    return [
      {
        error: 'No rows in the file',
        solution: 'Add rows. Did you accidentally import the wrong file?',
        values: null,
        header: null,
        cell: null,
        row: 2
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
        values: [staticHeader, ...config.staticHeadersConfig[staticHeader].aliases],
        header: staticHeader,
        cell: null,
        row: 1
      });
    }
  }

  // Validate the CSV has no unknown headers (if dynamic headers not ignored or allowed)
  if (!config.ignoreDynamicHeaders && !config.dynamicHeadersConfig && configUtils.worksheetDynamicHeaders.length) {
    for (const unknownHeader of configUtils.worksheetDynamicHeaders) {
      csvErrors.push({
        error: 'An unknown column is included in the file',
        solution: `Remove extra columns from the file.`,
        values: null,
        header: unknownHeader,
        cell: null,
        row: 1
      });
    }
  }

  return csvErrors;
};

/**
 * Iterate over each row in the CSV worksheet.
 *
 * @param {WorkSheet} worksheet - The worksheet
 * @param {CSVConfig} config - The CSV configuration
 * @param {(params: CSVRowParams, rowValidators: CSVRowValidator[]) => void} callback - The callback function
 * @returns {*} {void}
 */
export const forEachCSVRow = (
  worksheet: WorkSheet,
  config: CSVConfig,
  callback: (params: CSVRowParams, rowValidators: CSVRowValidator[]) => void
): void => {
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 0; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    callback({ row: worksheetRow, rowIndex: i }, config.rowValidators ?? []);
  }
};

/**
 * Iterate over each cell in the CSV row.
 *
 * @param {CSVRow} worksheetRow - The worksheet row object
 * @param {number} rowIndex - The worksheet row index - 0 is the first data row
 * @param {CSVConfig} config - The CSV configuration
 * @param {(params: CSVParams, headerConfig: CSVHeaderConfig) => void} callback - The callback function
 * @returns {*} {void}
 */
export const forEachCSVRowCell = (
  worksheetRow: CSVRow,
  rowIndex: number,
  config: CSVConfig,
  callback: (params: CSVParams, headerConfig: CSVHeaderConfig) => void
): void => {
  const staticHeaderConfigMap = _getCSVStaticHeaderMap(config);

  for (const header in worksheetRow) {
    // Get the header config for the cell (static or dynamic)
    const headerConfig = staticHeaderConfigMap.get(header) ?? config.dynamicHeadersConfig ?? {};
    const cell = worksheetRow[header];

    const params: CSVParams = {
      cell: cell,
      mutateCell: cell, // Set the mutate cell to the cell value
      header: header,
      row: worksheetRow,
      rowIndex: rowIndex,
      staticHeader: staticHeaderConfigMap.get(header)?.staticHeader
    };

    callback(params, {
      validateCell: headerConfig.validateCell,
      setCellValue: headerConfig.setCellValue
    });
  }
};

/**
 * Update the row state.
 *
 * Note: This mutates the CSV row objects `mutableRows`.
 *
 * @param {CSVRowParams} params - The CSV row parameters
 * @param {CSVRow[]} mutableRows - The mutable rows array
 * @returns {*} {void}
 */
export const updateRowState = (params: CSVRowParams, mutableRows: CSVRow[]) => {
  // Initialize the row if it does not exist
  if (!mutableRows[params.rowIndex] && params.row[CSVRowState]) {
    mutableRows[params.rowIndex] = {};
  }

  // Update the validated row state
  if (params.row?.[CSVRowState]) {
    const currentState = mutableRows[params.rowIndex][CSVRowState];
    const newState = params.row[CSVRowState];

    mutableRows[params.rowIndex][CSVRowState] = { ...currentState, ...newState };
  }
};

/**
 * Execute the row validator.
 *
 * Note: This mutates the CSV errors array `mutableErrors`.
 *
 * @param {CSVRowParams} params - The CSV row parameters
 * @param {CSVRowValidator} rowValidator - The row validator
 * @param {CSVError[]} mutableErrors - The mutable errors array
 * @returns {*} {void}
 */
export const executeRowValidator = (params: CSVRowParams, rowValidator: CSVRowValidator, mutableErrors: CSVError[]) => {
  const rowErrors = rowValidator(params);

  rowErrors.forEach((error) => {
    mutableErrors.push({
      error: error.error,
      solution: error.solution,
      values: error.values ?? null,
      cell: error.cell ?? null,
      header: error.header ?? null,
      row: _getErrorRowIndex(params, error.row)
    });
  });
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
  const row = { ...mutableRows[params.rowIndex] };

  const headerKey = params.staticHeader?.toUpperCase() ?? params.header.toUpperCase();
  const cellValue = headerConfig?.setCellValue?.(params) ?? params.mutateCell;

  // Remove the aliased header if it is not the static header
  if (params.staticHeader && params.header !== params.staticHeader) {
    delete row[params.header as Uppercase<string>];
  }

  row[headerKey as Uppercase<string>] = cellValue;

  mutableRows[params.rowIndex] = row;
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
        values: error.values ?? null,
        cell: (error.cell === undefined ? params.cell : error.cell) ?? null, // Use cell value if intentionally null
        header: (error.header === undefined ? params.header : error.header) ?? null, // Use header value if intentionally null
        row: _getErrorRowIndex(params, error.row)
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

/**
 * Get the row index the error occurred on.
 *
 * Note: Header row index 1. First data row index 2.
 * Note: `WorksheetRowIndexSymbol` is the original row index from the worksheet ie: before filtering empty rows
 *
 * @param {CSVRowParams} params - The CSV row or cell parameters
 * @param {number} [errorIndex] - The error index
 * @returns {*} {number} - The error row index
 */
const _getErrorRowIndex = (params: { row: CSVRow; rowIndex: number }, errorIndex?: number) => {
  // If the error index is provided use that
  if (errorIndex) {
    return errorIndex;
  }

  // This is injected by the `getWorksheetRowObjects` function
  if (params.row[WorksheetRowIndexSymbol]) {
    return params.row[WorksheetRowIndexSymbol] + 1;
  }

  // Params row index is 0 based
  return params.rowIndex + 2;
};
