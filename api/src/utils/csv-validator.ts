import Papa, { ParseConfig, ParseError, ParseResult } from 'papaparse';

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
  colErrors?: string[];
  rowColErrors?: string[];
  isValid: boolean;
}

export class CsvValidationError {
  fileErrors: string[];
  headerErrors: IHeaderErrors[];
  rowErrors: ParseError[];
  colErrors: string[];
  rowColErrors: string[];
  isValid: boolean;

  constructor() {
    this.fileErrors = [];
    this.headerErrors = [];
    this.rowErrors = [];
    this.colErrors = [];
    this.rowColErrors = [];
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
      colErrors: this.colErrors,
      rowColErrors: this.rowColErrors,
      isValid: this.isValid
    };
  }
}

export const isFileValid = (file: Express.Multer.File, headerRules?: IHeaderRules): ICsvState => {
  const csvValidationError = new CsvValidationError();

  if (isFileNull(file)) {
    csvValidationError.setFileErrors(['File is null']);
  }

  if (!isFileMimeValid(file, ['text/csv'])) {
    csvValidationError.setFileErrors(['File mimetype is invalid']);
  }

  const fileContent = getFileContent(file, { header: true, skipEmptyLines: true });

  console.log(fileContent);

  if (!fileContent) {
    csvValidationError.setFileErrors(['Failed to parse file']);
  }

  if (fileContent.errors.length) {
    csvValidationError.setFileErrors(['Failed to parse file']);
    csvValidationError.setRowErrors(fileContent.errors);
  }

  if (isCSVNull(fileContent.data)) {
    csvValidationError.setFileErrors(['File is empty']);
  }

  const headers = getHeaderRow(fileContent.data);

  const duplicateHeaderErrors = getDuplicateHeaders(headers);

  if (duplicateHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse file']);
    csvValidationError.addHeaderErrors(duplicateHeaderErrors);
  }

  const requriedHeaderErrors = hasRequiredHeaders(headers, headerRules?.requiredHeaders);

  if (requriedHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse file']);
    csvValidationError.addHeaderErrors(requriedHeaderErrors);
  }

  const validHeaderErrors = hasValidHeaders(headers, headerRules?.validHeaders);

  if (validHeaderErrors.length) {
    csvValidationError.setFileErrors(['Failed to parse file']);
    csvValidationError.addHeaderErrors(validHeaderErrors);
  }

  return csvValidationError.getState();
};

export const isFileNull = (file: Express.Multer.File): boolean => {
  if (!file) {
    return true;
  }

  return false;
};

export const getFileContent = (file: Express.Multer.File, options?: ParseConfig<string[]>): ParseResult<string[]> => {
  return Papa.parse(file.buffer.toString(), options);
};

export const isFileMimeValid = (file: Express.Multer.File, validMimeTypes: string[]): boolean => {
  if (!validMimeTypes?.length) {
    return true;
  }

  if (!validMimeTypes.includes(file.mimetype)) {
    return false;
  }

  return true;
};

export const getHeaderRow = (data: string[][]): string[] => {
  if (!data?.length) {
    return [];
  }

  return data[0];
};

export const isCSVNull = (data: string[][]): boolean => {
  if (!data?.length) {
    return true;
  }

  return false;
};

export const getDuplicateHeaders = (headers: string[]): IHeaderErrors[] => {
  if (!headers?.length) {
    return [];
  }

  const seenHeaders: string[] = [];

  const headerErrors: IHeaderErrors[] = [];

  for (const header of headers) {
    if (seenHeaders.includes(header)) {
      headerErrors.push({
        type: 'Invalid',
        code: 'DuplicateHeader',
        message: 'Duplicate header',
        col: header
      });
    } else {
      seenHeaders.push(header);
    }
  }

  return headerErrors;
};

export const hasRequiredHeaders = (headers: string[], requiredHeaders?: string[]): IHeaderErrors[] => {
  if (!requiredHeaders?.length) {
    return [];
  }

  if (!headers?.length) {
    return requiredHeaders.map((requiredHeader) => {
      return {
        type: 'Missing',
        code: 'MissingRequiredHeader',
        message: 'Missing required header',
        col: requiredHeader
      };
    });
  }

  const headerErrors: IHeaderErrors[] = [];

  for (const requiredHeader of requiredHeaders) {
    if (!headers.includes(requiredHeader)) {
      headerErrors.push({
        type: 'Missing',
        code: 'MissingRequiredHeader',
        message: 'Missing required header',
        col: requiredHeader
      });
    }
  }

  return headerErrors;
};

export const hasValidHeaders = (headers: string[], validHeaders?: string[]): IHeaderErrors[] => {
  if (!validHeaders?.length) {
    return [];
  }

  const headerErrors: IHeaderErrors[] = [];

  for (const header of headers) {
    if (!validHeaders.includes(header)) {
      headerErrors.push({
        type: 'Invalid',
        code: 'UnknownHeader',
        message: 'Unsupported header',
        col: header
      });
    }
  }

  return headerErrors;
};
