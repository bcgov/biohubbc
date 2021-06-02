import { ParseError } from 'papaparse';
import { validateFileHeaders, validateFileRows, validateFileTypeAndContent } from './validateCsvFile';

export type IHeaderErrorType = 'Invalid' | 'Missing';
export type IHeaderErrorCode = 'DuplicateHeader' | 'UnknownHeader' | 'MissingRequiredHeader';
export interface IHeaderErrors {
  type: IHeaderErrorType;
  code: IHeaderErrorCode;
  message: string;
  col: string | number;
}

export interface IHeaderRules {
  validHeaders?: string[];
  requiredHeaders?: string[];
  requiredFieldsByHeader?: string[];
}

export interface ICsvState {
  fileErrors?: string[];
  headerErrors?: IHeaderErrors[];
  rowErrors?: ParseError[];
  isValid: boolean;
}

export class CsvValidationError {
  fileErrors: string[];
  headerErrors: IHeaderErrors[];
  rowErrors: ParseError[];
  isValid: boolean;

  constructor() {
    this.fileErrors = [];
    this.headerErrors = [];
    this.rowErrors = [];
    this.isValid = true;
  }

  setFileErrors(errors: string[]) {
    this.fileErrors = errors;
    this.isValid = false;
  }

  setHeaderErrors(errors: IHeaderErrors[]) {
    this.headerErrors = errors;
    this.isValid = false;
  }

  addHeaderErrors(errors: IHeaderErrors[]) {
    this.headerErrors = this.headerErrors.concat(errors);
    this.isValid = false;
  }

  setRowErrors(errors: ParseError[]) {
    this.rowErrors = errors;
    this.isValid = false;
  }

  addRowErrors(errors: ParseError[]) {
    this.rowErrors = this.rowErrors.concat(errors);
    this.isValid = false;
  }

  setIsValid(isValid: boolean) {
    this.isValid = isValid;
  }

  getState(): ICsvState {
    return {
      fileErrors: this.fileErrors,
      headerErrors: this.headerErrors,
      rowErrors: this.rowErrors,
      isValid: this.isValid
    };
  }
}

export const isFileValid = (file: Express.Multer.File, headerRules?: IHeaderRules): ICsvState => {
  const csvValidationError = new CsvValidationError();

  validateFileTypeAndContent(file, csvValidationError);

  validateFileHeaders(file, csvValidationError, headerRules);

  validateFileRows(file, csvValidationError, headerRules);

  return csvValidationError.getState();
};
