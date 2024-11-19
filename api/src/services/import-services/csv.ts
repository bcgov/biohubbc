import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { getWorksheetRowObjects } from '../../utils/xlsx-utils/worksheet-utils';
import { Row } from './import-csv.interface';

interface CSVError {
  row: number;
  header?: string;
  error: string;
  solution?: string;
  meta?: Record<string, unknown>;
}

interface CSVParams {
  value: unknown;
  header: string;
  rowIndex: number;
  worksheet: WorkSheet;
}

interface CSVHeader {
  name: string;
  aliases?: string[];

  cellSchema: z.ZodSchema;
  cellUnique: boolean;
  validateCell?: (params: CSVParams) => CSVError[];
  getCellValue?: (params: CSVParams) => unknown;
}

interface CSVConfig {
  headers: CSVHeader[];
  allowUnknownHeaders?: true;
  validateUnknownCell?: (params: CSVParams) => CSVError[] | unknown;
}

type CSVWorksheet = Record<string, { cellValue: unknown; headerAlias?: string }>[];

const getCSVHeader = (
  header: string,
  row: Row,
  config: CSVConfig
): { header: string; isAlias: boolean; isUnknown: boolean } => {
  for (const headerConfig of config.headers) {
    for (const alias of headerConfig.aliases ?? []) {
      if (alias in row) {
        return { header: headerConfig.name, isAlias: true, isUnknown: false };
      }
    }
  }
};

export const getCSVWorksheet = (worksheet: WorkSheet, config: CSVConfig): CSVWorksheet => {
  const csvWorksheet: CSVWorksheet = [];

  const worksheetRows = getWorksheetRowObjects(worksheet);

  for (const worksheetRow of worksheetRows) {
    const csvRow: Record<string, { cellValue: unknown; headerAlias?: string }> = {};

    for (const header of config.headers) {
      if (header.name in worksheetRow) {
        csvRow[header.name] = { cellValue: worksheetRow[header.name], headerAlias: undefined };
      }
    }

    csvWorksheet.push(csvRow);
  }

  return csvWorksheet;
};

export const validateCSVWorksheet = (worksheet: WorkSheet, config: CSVConfig) => {
  const errors: CSVError[] = [];
  const headers = Object.keys(worksheet[0]);
};

//export type CSVTemplate = {
//  errors: CSVError[];
//  headers: string[];
//  unknownHeaders: string[];
//  rows: CSVTemplateRow[];
//};

//
//const getCSVTemplate = (worksheet: WorkSheet, config: CSVConfig) => {
//  const template: CSVTemplate = [];
//  const worksheetRows = getWorksheetRowObjects(worksheet);
//
//  for (const worksheetRow of worksheetRows) {
//    const templateRow: CSVTemplateRow = {};
//
//    for (const headerOrAlias of Object.keys(worksheetRow)) {
//      if (headerOrAlias in config.headers) {
//      }
//    }
//
//    template.push(templateRow);
//  }
//
//  return template;
//};

//export const validateCSVHeaders = (worksheet: WorkSheet, config: CSVConfig): CSVError[] => {
//  const csvErrors: CSVError[] = [];
//
//  const worksheetHeaders = Object.keys(worksheet[0]);
//  const configHeaders = config.headers.map((header) => header.name);
//
//  if (!worksheetHeaders.length) {
//    return [{ row: 0, error: 'CSV is empty', solution: 'Fill in missing CSV data', meta: { headers: configHeaders } }];
//  }
//
//  const missingHeaders = difference(configHeaders, worksheetHeaders);
//  const unknownHeaders = xor(worksheetHeaders, configHeaders);
//
//  missingHeaders.forEach((header) => {
//    csvErrors.push({ row: 0, error: `CSV missing required header`, solution: `Add missing header: '${header}'` });
//  });
//
//  if (!config.allowUnknownHeaders) {
//    unknownHeaders.forEach((header) => {
//      csvErrors.push({ row: 0, error: `CSV unknown header detected`, solution: `Remove unknown header: '${header}'` });
//    });
//  }
//
//  return csvErrors;
//};
//
//export const validateCSVCells = () => {};
////
////export const validateCSVUnknownCells = () => {};
//
//export const validateCSV = () => {};

export const getCritterCSVConfig = async (): Promise<CSVConfig> => {
  return {
    headers: [
      {
        name: 'NAME',
        aliases: ['FULL_NAME'],
        cellSchema: z.string(),
        cellUnique: true
      },
      {
        name: 'NICKNAME',
        aliases: ['ALIAS'],
        cellSchema: z.string(),
        cellUnique: true
      },
      {
        name: 'AGE',
        aliases: ['YEARS_OLD'],
        cellSchema: z.number().optional(),
        cellUnique: false
      }
    ],
    allowUnknownHeaders: true,
    validateUnknownCell: (_params) => {
      return 'string';
    }
  };
};
