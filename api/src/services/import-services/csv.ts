import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { getWorksheetRowObjects } from '../../utils/xlsx-utils/worksheet-utils';

interface CSVError {
  row: number;
  header?: string;
  error: string;
  solution?: string;
}

interface CSVParams {
  value: unknown;
  header: string;
  rowIndex: number;
  worksheet: WorkSheet;
}

interface CSVHeader {
  headerName: string[];

  cellSchema: z.ZodSchema;
  unique: boolean;
  validateCell?: (params: CSVParams) => CSVError[];
  getCellValue?: (params: CSVParams) => unknown;
}

interface CSVConfig {
  headers: CSVHeader[];
  allowUnknownHeaders?: true;
  validateUnknownCell?: (params: CSVParams) => CSVError[] | unknown;
}

export const getCritterCSVConfig = async (): Promise<CSVConfig> => {
  return {
    headers: [
      {
        headerName: ['NAME'],
        cellSchema: z.string(),
        unique: true
      },
      {
        headerName: ['NICKNAME', 'NICK', 'ALIAS'],
        cellSchema: z.string(),
        unique: true
      },
      {
        headerName: ['AGE', 'YEARS'],
        cellSchema: z.number().optional(),
        unique: false
      }
    ],
    allowUnknownHeaders: true,
    validateUnknownCell: (_params) => {
      return 'string';
    }
  };
};

/**
 * Get the configuration map for the CSV headers.
 *
 * @param {CSVConfig} config - The CSV configuration
 * @returns {Map<string, CSVHeader>} - The header config Map
 */
const getCSVConfigMap = (config: CSVConfig) => {
  const headerMap = new Map<string, CSVHeader>();

  for (const header of config.headers) {
    for (const headerName of header.headerName) {
      if (headerMap.has(headerName)) {
        throw new Error(`Duplicate header name in config: ${headerName}`);
      }
      headerMap.set(headerName, header);
    }
  }

  return headerMap;
};

const getCSVWorksheetKnownHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const configMap = getCSVConfigMap(config);
  return Object.keys(worksheet[0]).filter((header) => configMap.has(header));
};

const getCSVWorksheetUnknownHeaders = (worksheet: WorkSheet, config: CSVConfig) => {
  const configMap = getCSVConfigMap(config);
  return Object.keys(worksheet[0]).filter((header) => !configMap.has(header));
};

const _validateCSVCellValue = (params: CSVParams, headerConfig: CSVHeader) => {
  const cellErrors: CSVError[] = [];

  const parsed = headerConfig.cellSchema.safeParse(params.value);

  if (!parsed.success) {
    return [
      {
        row: params.rowIndex,
        header: params.header,
        error: `Invalid cell value. ${parsed.error.message}`,
        solution: `Cell value must be of type ${headerConfig.cellSchema._def.description}`
      }
    ];
  }

  if (headerConfig.validateCell) {
    const customErrors = headerConfig.validateCell(params);

    if (customErrors) {
      cellErrors.push(...customErrors);
    }
  }

  return cellErrors;
};

export const validateCSVRows = (worksheet: WorkSheet, config: CSVConfig) => {
  const csvErrors: CSVError[] = [];

  const configMap = getCSVConfigMap(config);
  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (let i = 1; i < worksheetRows.length; i++) {
    const worksheetRow = worksheetRows[i];

    for (const header in worksheetRow) {
      const headerConfig = configMap.get(header);
      const cellValue = worksheetRow[header];

      if (!headerConfig) {
        continue;
      }

      // TODO: Validate unique cell values

      _validateCSVCellValue({ value: cellValue, header, rowIndex: i, worksheet }, headerConfig);
    }
  }

  return csvErrors;
};

export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
  const csvErrors: CSVError[] = [];

  const knownWorksheetHeaders = getCSVWorksheetKnownHeaders(worksheet, config);
  const unknownWorksheetHeaders = getCSVWorksheetUnknownHeaders(worksheet, config);

  if (config.headers.length !== knownWorksheetHeaders.length) {
    return [
      {
        row: 0,
        error: 'CSV missing required headers',
        solution: `Add missing required headers. Supported headers: ${config.headers.map(
          (header) => header.headerName[0]
        )}`
      }
    ];
  }

  if (!config.allowUnknownHeaders && unknownWorksheetHeaders.length) {
    for (const unknownHeader of unknownWorksheetHeaders) {
      csvErrors.push({
        row: 0,
        error: `CSV unknown header detected`,
        solution: `Remove header '${unknownHeader}' from CSV`
      });
    }
  }

  return csvErrors;
};
