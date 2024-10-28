import { WorkSheet } from 'xlsx';
import { Row } from './import-csv.interface';

interface CSVErrors {
  [column: string]: {
    [row: number]: string[];
  };
}

export interface CSVStandardSchema {
  [standardColumnName: string]: {
    /**
     * Column aliases
     */
    aliases: string[];
    /**
     * Is the column optional
     */
    optional?: true;
    /**
     * 1. Pre-parse the cell value before validation
     */
    preParseCell?: (value: any, row: Row) => any;
    /**
     * 2. Validate the cell value
     */
    validateCell: (value: any, row: Row) => string[] | undefined;
    /**
     * 3. Get the cell value after validation
     */
    getCellValue?: (value: any, row: Row) => any;
  };
}

export interface CSVUnknownSchema {
  parseCell?: (value: any, row: Row) => any;
  validateCell: (value: any, row: Row) => string[] | undefined;
}

export type CSVSchema = { standardColumns: CSVStandardSchema; unknownColumns?: CSVUnknownSchema };

export interface CSVImportStrategy {
  cellValidatorService: CSVCellValidatorService;

  getCSVSchema(worksheet: WorkSheet): Promise<CSVSchema>;
  import(rows: Row[]): Promise<any>;
}

export class CSVCellValidatorService {
  validateStringCell(value: unknown) {
    if (typeof value !== 'string') {
      return ['Value is not a string.'];
    }
  }

  validateNumberCell(value: unknown, min?: number, max?: number) {
    const errors: string[] = [];

    if (typeof value !== 'number') {
      return ['Value is not a number']; // Early return
    }

    if (min !== undefined && value < min) {
      errors.push(`Value is less than minimum: ${min}.`);
    }

    if (max !== undefined && value > max) {
      errors.push(`Value is greater than maximum: ${max}.`);
    }

    return errors;
  }

  validateCodeCell(value: unknown, codes: Set<any>) {
    if (!codes.has(value)) {
      return [`Value is not a valid code: ${value}.`];
    }
  }
}

class ImportCritter implements CSVImportStrategy {
  cellValidator: CSVCellValidatorService;

  constructor() {
    this.cellValidator = new CSVCellValidatorService();
  }

  async getCSVSchema(): Promise<CSVSchema> {
    const surveyAliases = new Set(['ANIMAL_NAME', 'CRITTER_NAME']);

    return {
      standardColumns: {
        NAME: {
          aliases: ['ANIMAL_NAME', 'CRITTER_NAME'],
          preParseCell: (value) => value.toLowerCase(),
          validateCell: (value) => this.cellValidator.validateStringCell(value)
        },
        AGE: {
          aliases: ['ANIMAL_AGE', 'CRITTER_AGE'],
          validateCell: (value) => this.cellValidator.validateNumberCell(value, 0, 100)
        },
        ALIAS: {
          aliases: ['ANIMAL_ALIAS', 'CRITTER_ALIAS'],
          optional: true,
          preParseCell: (value) => value.toLowerCase(),
          validateCell: (value) => {
            if (surveyAliases.has(value)) {
              return ['Value already exists in Survey. Duplicates are not allowed.'];
            }
          }
        }
      },
      unknownColumns: {
        validateCell: (value) => this.cellValidator.validateStringCell(value)
      }
    };
  }

  async import(rows: Row[]): Promise<any> {
    console.log(rows);
    // Import critters
  }
}
