import xlsx from 'xlsx';
import { IMediaState } from '../media-file';
import { DWC_CLASS } from './dwc/dwc-archive-file';
import { XSLX_CLASS } from './xslx/xslx-validator';

export interface IWorkbook {
  workbook: CSVWorkBook;
}

export interface IWorksheets {
  worksheets:
    | { [name in DWC_CLASS]?: CSVWorksheet }
    | { [name in XSLX_CLASS]?: CSVWorksheet }
    | { [name: string]: CSVWorksheet };
}

export class CSVWorkBook implements IWorksheets {
  workbook: xlsx.WorkBook;

  worksheets: { [name: string]: CSVWorksheet };

  constructor(rawWorkbook?: xlsx.WorkBook) {
    this.workbook = rawWorkbook || xlsx.utils.book_new();

    this.worksheets = {};

    for (const [key, value] of Object.entries(this.workbook.Sheets)) {
      this.worksheets[key] = new CSVWorksheet(key, value);
    }
  }

  setWorksheet(name: string, worksheet: CSVWorksheet) {
    this.worksheets[name] = worksheet;
  }
}

export class CSVWorksheet {
  name: string;

  worksheet: xlsx.WorkSheet;

  _headers: string[];
  _rows: (string | number)[][];

  csvValidation: CSVValidation;

  constructor(name: string, worksheet: xlsx.WorkSheet) {
    this.name = name;

    this.worksheet = worksheet;

    this._headers = [];
    this._rows = [];

    this.csvValidation = new CSVValidation(this.name);
  }

  /**
   * Returns an array of header values.
   *
   * Note: This is always the first row (index 0)
   *
   * @return {*}  {string[]}
   * @memberof CSVWorksheet
   */
  getHeaders(): string[] {
    if (!this.worksheet) {
      return [];
    }

    const ref = this.worksheet['!ref'];

    if (!ref) {
      return [];
    }

    if (!this._headers.length) {
      const originalRange = xlsx.utils.decode_range(ref);

      // Specify range to only include the 0th row (header row)
      const customRange: xlsx.Range = { ...originalRange, e: { ...originalRange.e, r: 0 } };

      const aoaHeaders: any[][] = xlsx.utils.sheet_to_json(this.worksheet, {
        header: 1,
        blankrows: false,
        range: customRange
      });

      // Parse the headers array from the array of arrays produced by calling `xlsx.utils.sheet_to_json`
      this._headers = aoaHeaders[0];
    }

    return this._headers;
  }

  /**
   * Return an array of row value arrays.
   *
   * Note: This does not include the first row (header row).
   *
   * @return {*}  {((string | number)[][])}
   * @memberof CSVWorksheet
   */
  getRows(): (string | number)[][] {
    if (!this.worksheet) {
      return [];
    }

    const ref = this.worksheet['!ref'];

    if (!ref) {
      return [];
    }

    if (!this._rows.length) {
      const originalRange = xlsx.utils.decode_range(ref);

      // Specify range to not include the 0th row (header row)
      const customRange: xlsx.Range = { ...originalRange, s: { ...originalRange.s, r: 1 } };

      this._rows = xlsx.utils.sheet_to_json(this.worksheet, { header: 1, blankrows: false, range: customRange });
    }

    return this._rows;
  }

  /**
   * Set an entire row.
   *
   * Note: will overwrite any existing row data for the specified row number.
   *
   * Note: set row to `-1` to append the row to the end.
   *
   * @param {number} row the row number (row indexes start at 1)
   * @param {((string | number)[])} data
   * @memberof CSVWorksheet
   */
  setRow(row: number, data: (string | number)[]) {
    xlsx.utils.sheet_add_aoa(this.worksheet, [data], { origin: row });

    // Reset _rows so that the worksheet is re-parsed when getRows is called
    this._rows = [];
  }

  /**
   * Set a cell.
   *
   * @param {number} row the row number (row indexes start at 1)
   * @param {number} col the column number (column indexes start at 0)
   * @param {(string | number)} data
   * @memberof CSVWorksheet
   */
  setCell(row: number, col: number, data: string | number) {
    xlsx.utils.sheet_add_aoa(this.worksheet, [[data]], { origin: { r: row, c: col } });

    // Reset _rows so that the worksheet is re-parsed when getRows is called
    this._rows = [];
  }

  validate(validators: CSVValidator[]): CSVValidation {
    validators.forEach((validator) => validator(this));

    return this.csvValidation;
  }
}

export type IHeaderErrorType = 'Invalid' | 'Missing';
export type IHeaderErrorCode = 'DuplicateHeader' | 'UnknownHeader' | 'MissingRequiredHeader';
export interface IHeaderError {
  type: IHeaderErrorType;
  code: IHeaderErrorCode;
  message: string;
  col: string | number;
}

export type IRowErrorType = 'Invalid' | 'Missing';
export type IRowErrorCode = 'MissingRequiredField';
export interface IRowError {
  type: IRowErrorType;
  code: IRowErrorCode;
  message: string;
  row: number;
}

export interface ICsvState extends IMediaState {
  headerErrors?: IHeaderError[];
  rowErrors?: IRowError[];
}

export type CSVValidator = (csvWorksheet: CSVWorksheet, ...rest: any) => CSVWorksheet;

export class CSVValidation {
  fileName: string;
  fileErrors: string[];
  headerErrors: IHeaderError[];
  rowErrors: IRowError[];
  isValid: boolean;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.fileErrors = [];
    this.headerErrors = [];
    this.rowErrors = [];
    this.isValid = true;
  }

  addFileErrors(errors: string[]) {
    this.fileErrors = this.fileErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addHeaderErrors(errors: IHeaderError[]) {
    this.headerErrors = this.headerErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  addRowErrors(errors: IRowError[]) {
    this.rowErrors = this.rowErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
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
