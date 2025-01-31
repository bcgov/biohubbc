import { WorkSheet } from 'xlsx';
import { getWorksheetRowObjects, WorksheetRowIndexSymbol } from '../xlsx-utils/worksheet-utils';
import { CSVConfigUtils } from './csv-config-utils';
import {
  CSVCellSetter,
  CSVCellValidator,
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
 * @returns {*} {{ errors: Required<CSVError>[]; rows: CSVRowValidated[] }} - The CSV errors and rows
 */
export const validateCSVWorksheet = <StaticHeaderType extends Uppercase<string>>(
  worksheet: WorkSheet,
  config: CSVConfig<StaticHeaderType>
): { errors: Required<CSVError>[]; rows: CSVRowValidated<StaticHeaderType>[] } => {
  const rows: CSVRowValidated<StaticHeaderType>[] = [];
  const errors: Required<CSVError>[] = validateCSVHeaders(worksheet, config);

  // If there are errors in the headers, return early
  if (errors.length) {
    return { errors: errors, rows: [] };
  }

  // Iterate over each row in the worksheet and execute the row validators
  forEachCSVRow(worksheet, config, (rowParams, rowValidators) => {
    // Execute the row validators and push the errors
    rowValidators.forEach((rowValidator) => {
      errors.push(...executeRowValidator(rowParams, rowValidator));
    });

    const validatedRow: CSVRow = {};

    // Iterate over each cell in the row and validate + set cell values
    forEachCSVRowCell(rowParams.row, rowParams.rowIndex, config, (cellParams, headerConfig) => {
      // Validate the cell value and push the cell errors
      if (headerConfig.validateCell) {
        errors.push(...executeValidateCell(cellParams, headerConfig.validateCell));
      }

      // If there are errors in the cell don't set the cell value
      if (errors.length) {
        return;
      }

      const { header, cell } = executeSetCellValue(cellParams, headerConfig.setCellValue);

      // Set the header and cell value in the validated row
      // Note: The header is either the static header or the dynamic header ie: the CSV header
      validatedRow[header] = cell;
      // Copy the row state to the validated row
      validatedRow[CSVRowState] = rowParams.row[CSVRowState];
    });

    rows.push(validatedRow);
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
 * @returns {*} {Required<CSVError>[]} - The CSV errors
 */
export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): Required<CSVError>[] => {
  const csvErrors: Required<CSVError>[] = [];

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
        solution: `Add the ${staticHeader} column to the file.`,
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
        solution: `Remove the ${unknownHeader} column from the file.`,
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
 * Execute the row validator.
 *
 * @param {CSVRowParams} params - The CSV row parameters
 * @param {CSVRowValidator} rowValidator - The row validator
 * @returns {*} {Required<CSVError>[]}
 */
export const executeRowValidator = (params: CSVRowParams, rowValidator: CSVRowValidator): Required<CSVError>[] => {
  const rowErrors = rowValidator(params);

  // Map the partial row errors to the required error format ie: fill in the missing values
  return rowErrors.map((error) => ({
    error: error.error,
    solution: error.solution,
    values: error.values ?? null,
    cell: error.cell ?? null,
    header: error.header ?? null,
    row: _getErrorRowIndex(params, error.row)
  }));
};

/**
 * Execute the CSVConfig `setCellValue` callback for the cell.
 *
 * Note: This also swaps the aliased header for the known static header.
 *
 * @param {CSVParams} params - The CSV parameters
 * @param {CSVCellSetter} setCellValue - The header configuration
 * @returns {*} {CSVRow[]} - The updated row
 */
export const executeSetCellValue = (params: CSVParams, setCellValue?: CSVCellSetter) => {
  // The fallback is needed as dynamic headers have no static header
  const header = params.staticHeader?.toUpperCase() ?? params.header.toUpperCase();
  // Set the cell value from the handler or use the mutate cell value
  const cell = setCellValue?.(params) ?? params.mutateCell;

  return { header, cell };
};

/**
 * Execute the CSVConfig `validateCell` callback for the cell.
 *
 * @param {CSVParams} params - The CSV parameters
 * @param {CSVCellValidator} validateCell - The cell validator
 * @returns {*} {Required<CSVError>[]}
 */
export const executeValidateCell = (params: CSVParams, validateCell: CSVCellValidator): Required<CSVError>[] => {
  const cellErrors = validateCell(params);

  // Map the partial cell errors to the required error format ie: fill in the missing values
  return cellErrors.map((error) => ({
    error: error.error,
    solution: error.solution,
    values: error.values ?? null,
    // Use the error cell value if intentionally null - if undefined fall back to params cell value
    cell: (error.cell === undefined ? params.cell : error.cell) ?? null,
    // Use the error header value if intentionally null - if undefined fall back to params header value
    header: (error.header === undefined ? params.header : error.header) ?? null,
    row: _getErrorRowIndex(params, error.row)
  }));
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
        throw new Error(`Duplicate header in CSV config: ${uppercasedHeader}. Check for duplicate aliases.`);
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
