import { ParseError } from 'papaparse';
import { CSVFile } from './custom-file';

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
  fileName: string;
  fileErrors?: string[];
  headerErrors?: IHeaderErrors[];
  rowErrors?: ParseError[];
  isValid: boolean;
}

export class CSVValidation {
  fileName: string;
  fileErrors: string[];
  headerErrors: IHeaderErrors[];
  rowErrors: ParseError[];
  isValid: boolean;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.fileErrors = [];
    this.headerErrors = [];
    this.rowErrors = [];
    this.isValid = true;
  }

  setFileErrors(errors: string[]) {
    this.fileErrors = errors;

    if (errors?.length) {
      this.isValid = false;
    }
  }

  setHeaderErrors(errors: IHeaderErrors[]) {
    this.headerErrors = errors;

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addHeaderErrors(errors: IHeaderErrors[]) {
    this.headerErrors = this.headerErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  setRowErrors(errors: ParseError[]) {
    this.rowErrors = errors;

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addRowErrors(errors: ParseError[]) {
    this.rowErrors = this.rowErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  setIsValid(isValid: boolean) {
    this.isValid = isValid;
  }

  getState(): ICsvState {
    return {
      fileName: this.fileName,
      fileErrors: this.fileErrors,
      headerErrors: this.headerErrors,
      rowErrors: this.rowErrors,
      isValid: this.isValid
    };
  }
}

export type CSVValidator = (file: CSVFile, ...rest: any) => CSVFile;

export const validateCSVFile = (file: CSVFile, validators: CSVValidator[]): CSVValidation => {
  validators.forEach((validator) => validator(file));

  return file.csvValidation;
};
