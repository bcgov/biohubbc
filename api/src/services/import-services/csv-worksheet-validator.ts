import { difference, xor } from 'lodash';
import { WorkSheet } from 'xlsx';
import { z } from 'zod';
import { getWorksheetRowObjects } from '../../utils/xlsx-utils/worksheet-utils';
import { Row } from './import-csv.interface';

// 1. Get list of rows from the worksheet
// 2. Convert the non-standard column names to standard column names
// 3. Track the used alias
interface CSVError {
  row: number;
  column?: string;
  errors: string[];
}

type CSVRow = Record<string, { cell: unknown; alias?: string }>;

type CSVTemplate = CSVRow[];

export interface CSVConfig {
  standardColumns: {
    [standardColumnName: string]: {
      aliases?: string[];
      parseCell?: (value: unknown, row: CSVRow, template: CSVTemplate) => unknown;
      validateCell: (value: unknown, row: CSVRow, template: CSVTemplate) => { errors: string[] };
      setCell?: (value: any, row: CSVRow, template: CSVTemplate) => any;
    };
  };
  unknownColumns?: {
    parseCell?: (value: unknown, row: CSVRow, template: CSVTemplate) => unknown;
    validateCell: (value: unknown, row: CSVRow, template: CSVTemplate) => { errors: string[] };
    setCell?: (value: any, row: CSVRow, template: CSVTemplate) => any;
  };
}

export class ValidateCSVService {
  worksheet: WorkSheet;
  config: CSVConfig;

  constructor(worksheet: WorkSheet, config: CSVConfig) {
    this.worksheet = worksheet;
    this.config = config;
  }

  /**
   * Get the cell details for a given row and column.
   *
   * @param {Row} row - The row object
   * @param {string} column - The column name
   * @returns {*} - The cell value, column name, and alias if found
   */
  getCellDetails(row: Row, column: string) {
    if (column in row) {
      return { cell: row[column], column, alias: undefined };
    }

    for (const alias of this.config.standardColumns[column]?.aliases ?? []) {
      if (alias in row) {
        return { cell: row[alias], column, alias };
      }
    }
  }

  convertWorksheetToCSVTemplate(): CSVTemplate {
    const csv: CSVTemplate = [];

    const worksheetRows = getWorksheetRowObjects(this.worksheet);

    for (const worksheetRow of worksheetRows) {
      const csvRow: CSVRow = {};

      for (const header of Object.keys(worksheetRow)) {
        const cellDetails = this.getCellDetails(worksheetRow, header);

        if (cellDetails) {
          // Standard columns
          csvRow[cellDetails.column] = { cell: cellDetails.cell, alias: cellDetails.alias };
        } else {
          // Unknown columns
          csvRow[header] = { cell: worksheetRow[header] };
        }
      }

      csv.push(csvRow);
    }

    return csv;
  }

  validateColumnHeaders(template: CSVTemplate): CSVError | undefined {
    const errors: string[] = [];

    const csvWorksheetColumns = Object.keys(template[0]);
    const configStandardColumns = Object.keys(this.config.standardColumns);

    if (!csvWorksheetColumns.length) {
      return { row: 0, errors: ['CSV is empty'] };
    }

    const missingColumns = difference(configStandardColumns, csvWorksheetColumns);

    if (missingColumns.length) {
      errors.push(`CSV missing required columns: ${missingColumns.join(', ')}`);
    }

    const unknownColumns = xor(csvWorksheetColumns, configStandardColumns);

    if (unknownColumns.length && !this.config.unknownColumns) {
      errors.push(`CSV contains unknown columns: ${unknownColumns.join(', ')}`);
    }

    if (errors.length) {
      return { row: 0, errors };
    }
  }

  // TODO: Conditional worksheet / error return?
  validateCSV(): { template: CSVTemplate; errors: CSVError[] } {
    const template = this.convertWorksheetToCSVTemplate();
    const columnErrors = this.validateColumnHeaders(template);

    // If there are column errors, return early
    if (columnErrors) {
      return { template, errors: [columnErrors] };
    }

    const errors: CSVError[] = [];

    for (let index = 0; index < template.length; index++) {
      const row = template[index];

      for (const column of Object.keys(row)) {
        const { cell, alias } = row[column];

        let columnConfig = this.config.standardColumns[column];

        if (!columnConfig && this.config.unknownColumns) {
          columnConfig = this.config.unknownColumns;
        }

        let cellValue = columnConfig.parseCell?.(cell, row, template) ?? cell;

        const cellErrors = columnConfig.validateCell(cellValue, row, template);

        if (cellErrors?.errors.length) {
          errors.push({ row: index + 1, errors: cellErrors.errors, column: alias ?? column });
        }

        cellValue = columnConfig.setCell?.(cell, row, template) ?? cell;

        template[index][column] = { cell: cellValue, alias };
      }
    }

    return { template, errors };
  }
}

const getZodErrors = (value: unknown, schema: z.ZodSchema): { errors: string[] } => {
  const parsedValue = schema.safeParse(value);

  if (parsedValue.error) {
    return { errors: parsedValue.error.issues.map((issue) => issue.message) };
  }

  return { errors: [] };
};

export class ImportCritter implements CSVImportStrategy {
  async getCSVConfig(): Promise<CSVConfig> {
    const surveyAliases = new Set(['ANIMAL_NAME', 'CRITTER_NAME']);

    return {
      standardColumns: {
        NAME: {
          aliases: ['ANIMAL_NAME', 'CRITTER_NAME'],
          parseCell: (value) => `${value} critter`,
          validateCell: (value) => getZodErrors(value, z.string())
        },
        AGE: {
          aliases: ['ANIMAL_AGE', 'CRITTER_AGE'],
          validateCell: (value) => getZodErrors(value, z.number().min(0).max(100)),
          setCell: (value) => value + 'blah'
        },
        ALIAS: {
          aliases: ['ANIMAL_ALIAS', 'CRITTER_ALIAS'],
          validateCell: (value) => {
            const errors: string[] = [];

            if (surveyAliases.has(value as string)) {
              errors.push('Value already exists in Survey. Duplicates are not allowed.');
            }

            return { errors };
          }
        }
      },
      unknownColumns: {
        validateCell: () => ({ errors: ['Unknown column'] })
      }
    };
  }

  async importCSVTemplate(template: CSVTemplate): Promise<any> {
    console.log(template);
    // Import critters
  }
}

export interface CSVImportStrategy {
  getCSVConfig(worksheet: WorkSheet): Promise<CSVConfig>;
  importCSVTemplate(template: CSVTemplate[]): Promise<any>;
}
