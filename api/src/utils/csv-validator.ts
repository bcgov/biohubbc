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
  isValid: boolean;
}

export class CsvValidationError {
  fileErrors: string[];
  headerErrors: IHeaderErrors[];
  rowErrors: ParseError[];
  colErrors: string[];
  isValid: boolean;

  constructor() {
    this.fileErrors = [];
    this.headerErrors = [];
    this.rowErrors = [];
    this.colErrors = [];
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
      colErrors: this.colErrors,
      isValid: this.isValid
    };
  }
}

export const isFileValid = (file: Express.Multer.File, headerRules?: IHeaderRules): ICsvState => {
  const csvValidationError = new CsvValidationError();

  if (isFileNull(file)) {
    csvValidationError.setFileErrors(['file is null']);
  }

  if (!isFileMimeValid(file, ['text/csv'])) {
    csvValidationError.setFileErrors(['file mimetype is invalid']);
  }

  const fileContent = getFileContent(file, { skipEmptyLines: true });

  if (!fileContent) {
    csvValidationError.setFileErrors(['failed to parse file']);
  }

  if (fileContent.errors.length) {
    csvValidationError.setFileErrors(['failed to parse file']);
    csvValidationError.setRowErrors(fileContent.errors);
  }

  if (isCSVNull(fileContent.data)) {
    csvValidationError.setFileErrors(['file is empty']);
  }

  const headers = getHeaderRow(fileContent.data);

  const duplicateHeaderErrors = getDuplicateHeaders(headers);

  if (duplicateHeaderErrors.length) {
    csvValidationError.setFileErrors(['failed to parse file']);
    csvValidationError.addHeaderErrors(duplicateHeaderErrors);
  }

  const requriedHeaderErrors = hasRequiredHeaders(headers, headerRules?.requiredHeaders);

  if (requriedHeaderErrors.length) {
    csvValidationError.setFileErrors(['failed to parse file']);
    csvValidationError.addHeaderErrors(requriedHeaderErrors);
  }

  const validHeaderErrors = hasValidHeaders(headers, headerRules?.validHeaders);

  if (validHeaderErrors.length) {
    csvValidationError.setFileErrors(['failed to parse file']);
    csvValidationError.addHeaderErrors(validHeaderErrors);
  }

  const rows = getRows(fileContent.data);

  const requiredFieldErrors = hasRequiredFields(rows, headers, headerRules?.requiredFieldsByHeader);

  if (requiredFieldErrors.length) {
    csvValidationError.setFileErrors(['failed to parse file']);
    csvValidationError.addRowErrors(requiredFieldErrors);
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

export const getRows = (data: string[][]): string[][] => {
  if (!data?.length) {
    return [];
  }

  data.splice(0, 1);

  return data;
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

export const hasRequiredFields = (
  rows: string[][],
  headers: string[],
  requiredFieldsByHeader?: string[]
): ParseError[] => {
  if (!requiredFieldsByHeader?.length) {
    return [];
  }

  if (!rows?.length) {
    return requiredFieldsByHeader.map((requiredFieldByHeader) => {
      return {
        type: 'Missing',
        code: 'MissingRequiredField',
        message: `Missing value for required column: ${requiredFieldByHeader}`,
        row: 2
      };
    });
  }

  const rowErrors: ParseError[] = [];

  rows.forEach((row, rowIndex) => {
    for (const requiredFieldByHeader of requiredFieldsByHeader) {
      const columnIndex = headers.indexOf(requiredFieldByHeader);

      const rowValueForColumn = row[columnIndex];

      if (!rowValueForColumn) {
        rowErrors.push({
          type: 'Missing',
          code: 'MissingRequiredField',
          message: `Missing value for required column: ${requiredFieldByHeader}`,
          row: rowIndex + 2
        });
      }
    }
  });

  return rowErrors;
};
